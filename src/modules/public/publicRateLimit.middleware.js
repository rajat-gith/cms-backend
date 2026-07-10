const redis = require("../../utils/redisClient");
const config = require("../../config/index");

const WINDOW_SECONDS = parseInt(config.apiRateLimit.limitWindow || "60", 10);
const MAX_REQUESTS = parseInt(config.apiRateLimit.limitMaxRequests || "30", 10);
const KEY_PREFIX = "rateLimit:public:";

/**
 * Fixed-window rate limiter for public, bot-exposed endpoints.
 * Keys by API key when present (authenticated caller identity),
 * otherwise falls back to client IP so anonymous callers are still capped.
 * Fails open on Redis errors so an outage doesn't take down the public API.
 */
async function publicRateLimit(req, res, next) {
	const identity = req.apiCredential?.apiKey || req.query.apiKey || req.ip;
	const key = `${KEY_PREFIX}${identity}`;

	try {
		const count = await redis.incr(key);
		if (count === 1) {
			await redis.expire(key, WINDOW_SECONDS);
		}

		res.set("X-RateLimit-Limit", String(MAX_REQUESTS));
		res.set(
			"X-RateLimit-Remaining",
			String(Math.max(MAX_REQUESTS - count, 0)),
		);

		if (count > MAX_REQUESTS) {
			const ttl = await redis.ttl(key);
			res.set("Retry-After", String(ttl > 0 ? ttl : WINDOW_SECONDS));
			return res.status(429).json({
				message:
					"Too many requests. Please slow down and try again shortly.",
				retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS,
			});
		}

		return next();
	} catch (err) {
		console.error("publicRateLimit: Redis error, failing open:", err);
		return next();
	}
}

module.exports = publicRateLimit;
