const bcrypt = require("bcrypt");
const redis = require("../../utils/redisClient");
const ApiCredentialService = require("./apiCredential.service");
const UserService = require("../user/user.service");

const CACHE_PREFIX = "apiKey:";

async function apiKeyAuth(req, res, next) {
	try {
		const apiKey = req.headers["x-api-key"];
		const apiSecret = req.headers["x-api-secret"];

		if (!apiKey || !apiSecret) {
			return res.status(401).json({
				message: "Missing X-API-Key or X-API-Secret in headers",
			});
		}

		const redisKey = `${CACHE_PREFIX}${apiKey}`;
		let credential;

		// 1. Try Redis first
		const cached = await redis.get(redisKey);
		if (cached) {
			credential = JSON.parse(cached);
		} else {
			// 2. Fallback to DB
			credential = await ApiCredentialService.getCredentialByApiKey(
				apiKey
			);
			if (!credential) {
				return res.status(401).json({ message: "Invalid API key" });
			}

			// 3. Cache it
			await redis.setex(redisKey, 3600, JSON.stringify(credential));
		}

		// 4. Compare secrets
		const isValid = await bcrypt.compare(
			apiSecret,
			credential.api_secret_hash
		);
		if (!isValid) {
			return res.status(401).json({ message: "Invalid API secret" });
		}

		// 5. Load user from DB
		const user = await UserService.getUserById(credential.user_id);
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		// 6. Attach user and credential to request
		req.user = user;
		req.apiCredential = credential;

		// 7. Update lastUsedAt (non-blocking)
		ApiCredentialService.updateLastUsed(credential.id).catch(console.error);

		next();
	} catch (err) {
		console.error("❌ API Key Auth Error:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
}

module.exports = apiKeyAuth;
