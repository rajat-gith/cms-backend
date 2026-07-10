const pool = require("../../db/index");
const redis = require("../../utils/redisClient");
const config = require("../../config");
const queries = require("./aiCopilot.queries");

const REDIS_KEY_PREFIX = "aiCopilot:lastIngestedAt:";
const redisKeyFor = (userId) => `${REDIS_KEY_PREFIX}${userId}`;

const toCamelStatus = (row) => {
	if (!row) return null;
	return {
		lastIngestedAt: row.last_ingested_at,
		lastIngestStats: row.last_ingest_stats,
		lastError: row.last_error,
		updatedAt: row.updated_at,
	};
};

const AiCopilotService = {
	/**
	 * Reads last-ingested-at, preferring Redis and falling back to
	 * Postgres (repopulating Redis) on a cache miss.
	 */
	async getLastIngestedAt(userId) {
		try {
			const cached = await redis.get(redisKeyFor(userId));
			if (cached) return new Date(cached);
		} catch (err) {
			console.error(
				"AiCopilot: Redis read failed, falling back to DB:",
				err,
			);
		}

		const { rows } = await pool.query(queries._getStatusByUser(), [userId]);
		const status = toCamelStatus(rows[0]);
		if (status?.lastIngestedAt) {
			try {
				await redis.setex(
					redisKeyFor(userId),
					config.aiCopilot.redisTtlSeconds,
					new Date(status.lastIngestedAt).toISOString(),
				);
			} catch (err) {
				console.error("AiCopilot: Redis warm-up failed:", err);
			}
		}
		return status?.lastIngestedAt ? new Date(status.lastIngestedAt) : null;
	},

	/** Full status object for GET /status */
	async getStatus(userId) {
		const { rows } = await pool.query(queries._getStatusByUser(), [userId]);
		const status = toCamelStatus(rows[0]) || {
			lastIngestedAt: null,
			lastIngestStats: null,
			lastError: null,
			updatedAt: null,
		};

		const cooldownMs = config.aiCopilot.syncCooldownMs;
		const lastIngestedAt = status.lastIngestedAt
			? new Date(status.lastIngestedAt)
			: null;
		const nextSyncAvailableAt = lastIngestedAt
			? new Date(lastIngestedAt.getTime() + cooldownMs)
			: null;
		const canSync =
			!nextSyncAvailableAt || nextSyncAvailableAt <= new Date();

		return { ...status, canSync, nextSyncAvailableAt, cooldownMs };
	},

	/** Cheap Redis-first cooldown check used to gate POST /sync. */
	async checkCooldown(userId) {
		const lastIngestedAt = await this.getLastIngestedAt(userId);
		if (!lastIngestedAt) {
			return { allowed: true, retryAfterMs: 0, lastIngestedAt: null };
		}
		const elapsed = Date.now() - new Date(lastIngestedAt).getTime();
		const cooldownMs = config.aiCopilot.syncCooldownMs;
		if (elapsed >= cooldownMs) {
			return { allowed: true, retryAfterMs: 0, lastIngestedAt };
		}
		return {
			allowed: false,
			retryAfterMs: cooldownMs - elapsed,
			lastIngestedAt,
		};
	},

	/** Persist a successful ingestion to both Postgres and Redis. */
	async recordSuccess(userId, stats) {
		const { rows } = await pool.query(queries._upsertSuccess(), [
			userId,
			stats ? JSON.stringify(stats) : null,
		]);
		const status = toCamelStatus(rows[0]);
		try {
			await redis.setex(
				redisKeyFor(userId),
				config.aiCopilot.redisTtlSeconds,
				new Date(status.lastIngestedAt).toISOString(),
			);
		} catch (err) {
			console.error("AiCopilot: Redis write failed after ingest:", err);
		}
		return status;
	},

	/** Persist a failed ingestion attempt (does not touch the cooldown clock). */
	async recordFailure(userId, errorMessage) {
		const { rows } = await pool.query(queries._upsertFailure(), [
			userId,
			errorMessage,
		]);
		return toCamelStatus(rows[0]);
	},

	/**
	 * Calls the ai-portfolio-copilot FastAPI service's POST /ingest-profile,
	 * forwarding per-request CMS credentials and the profile_id to (re)index.
	 */
	async triggerIngestion({ profileId, apiKey, apiSecret }) {
		const url = `${config.aiCopilot.baseUrl}/ingest-profile`;
		const controller = new AbortController();
		const timeout = setTimeout(
			() => controller.abort(),
			config.aiCopilot.requestTimeoutMs,
		);

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
					"X-API-Secret": apiSecret,
				},
				body: JSON.stringify({ profile_id: profileId }),
				signal: controller.signal,
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				const message =
					data?.detail ||
					data?.message ||
					`Ingestion service returned ${response.status}`;
				throw new Error(message);
			}
			return data;
		} finally {
			clearTimeout(timeout);
		}
	},

	/**
	 * Calls the ai-portfolio-copilot FastAPI service's POST /ask-profile.
	 * Unauthenticated on the FastAPI side — meant to be hit by visitors.
	 */
	async askProfile(question, profileId) {
		const url = `${config.aiCopilot.baseUrl}/ask-profile`;
		const controller = new AbortController();
		const timeout = setTimeout(
			() => controller.abort(),
			config.aiCopilot.requestTimeoutMs,
		);

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					question: question,
					profile_id: profileId,
				}),
				signal: controller.signal,
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				const message =
					data?.detail ||
					data?.message ||
					`Ask service returned ${response.status}`;
				throw new Error(message);
			}
			return data;
		} finally {
			clearTimeout(timeout);
		}
	},
};

module.exports = AiCopilotService;
