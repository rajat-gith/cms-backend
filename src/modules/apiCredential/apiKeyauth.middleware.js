const ApiCredential = require("./apiCredential.model");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");
const redis = require("../../utils/redisClient");

const CACHE_PREFIX = "apiKey:";

async function apiKeyAuth(req, res, next) {
    try {
        // Extract API credentials from headers
        const apiKey = req.headers["x-api-key"];
        const apiSecret = req.headers["x-api-secret"];

        if (!apiKey || !apiSecret) {
            return res
                .status(401)
                .json({
                    message: "Missing X-API-Key or X-API-Secret in headers",
                });
        }

        // 1. Try Redis cache
        let cached = await redis.get(`${CACHE_PREFIX}${apiKey}`);
        let credential;

        if (cached) {
            credential = JSON.parse(cached);
        } else {
            credential = await ApiCredential.findOne({
                apiKey,
                isActive: true,
            }).lean();

            if (!credential) {
                return res.status(401).json({ message: "Invalid API key" });
            }

            // Store in cache for 1 hour
            await redis.setex(
                `${CACHE_PREFIX}${apiKey}`,
                3600,
                JSON.stringify(credential)
            );
        }

        // 2. Compare secret
        const valid = await bcrypt.compare(apiSecret, credential.apiSecretHash);
        if (!valid) {
            return res.status(401).json({ message: "Invalid API secret" });
        }

        // 3. Load user
        const user = await User.findById(credential.user).lean();
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // 4. Attach to request
        req.user = user;
        req.apiCredential = credential;

        // 5. Optional: update last used
        ApiCredential.updateOne(
            { _id: credential._id },
            { lastUsedAt: new Date() }
        ).exec();

        next();
    } catch (err) {
        console.error("❌ API Key Auth Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = apiKeyAuth;
