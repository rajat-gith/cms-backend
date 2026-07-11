const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const AiCopilotService = require("./aiCopilot.service");
const ApiCredentialService = require("../apiCredential/apiCredential.service");

const AiCopilotController = {
	/**
	 * GET /ai-copilot/status
	 * Tells the frontend when data was last ingested and whether the user
	 * can trigger another sync right now.
	 */
	async getStatus(req, res) {
		try {
			const userId = req.user._id;
			const status = await AiCopilotService.getStatus(userId);
			res.status(200).json({ data: status });
		} catch (err) {
			console.error("Error fetching AI copilot status:", err);
			res.status(500).json({
				error: err.message || "Failed to fetch AI copilot status",
			});
		}
	},

	/**
	 * POST /ai-copilot/sync
	 * Re-ingests the caller's profile data. Rejects with 429 if called
	 * again before the cooldown window has elapsed.
	 */
	async sync(req, res) {
		const userId = req.user._id;

		try {
			const cooldown = await AiCopilotService.checkCooldown(userId);
			if (!cooldown.allowed) {
				return res.status(429).json({
					error: "Sync was run recently. Please wait before syncing again.",
					lastIngestedAt: cooldown.lastIngestedAt,
					retryAfterMs: cooldown.retryAfterMs,
					retryAfterSeconds: Math.ceil(cooldown.retryAfterMs / 1000),
				});
			}

			// Mint a short-lived credential so the FastAPI service can pull
			// this user's profile data from the /public/* endpoints, then
			// delete it right after use.
			const apiKey = req.headers["x-api-key"];
			const apiSecret = req.headers["x-api-secret"];

			try {
				const profileId = `${req.user.username}_${req.user._id}`
				const stats = await AiCopilotService.triggerIngestion({
					profileId: profileId,
					apiKey,
					apiSecret: apiSecret,
				});

				const status = await AiCopilotService.recordSuccess(
					userId,
					stats,
				);

				return res.status(200).json({
					message: "Sync completed successfully",
					data: status,
					stats,
				});
			} catch (ingestErr) {
				await AiCopilotService.recordFailure(userId, ingestErr.message);
				throw ingestErr;
			}
		} catch (err) {
			console.error("Error syncing AI copilot:", err);
			res.status(502).json({
				error: err.message || "Failed to sync profile data",
			});
		}
	},

	/**
	 * POST /ai-copilot/ask
	 * Public proxy — frontend never talks to the FastAPI service directly.
	 */
	async ask(req, res) {
		try {
			const { question } = req.body;
			if (!question || typeof question !== "string" || !question.trim()) {
				return res.status(400).json({ error: "question is required" });
			}
			const profileId = `${req.user.username}_${req.user._id}`;
			const result = await AiCopilotService.askProfile(
				question.trim(),
				profileId,
			);
			res.status(200).json({ data: result });
		} catch (err) {
			console.error("Error asking AI copilot:", JSON.stringify(err));
			res.status(502).json({
				error: err.message || "Failed to get an answer right now",
			});
		}
	},
};

module.exports = AiCopilotController;
