const ApiCredential = require("./apiCredential.model");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");
const redis = require("../../utils/redisClient");

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

        // 1. Try to get credential from Upstash Redis
        const cached = await redis.get(redisKey);

        if (cached) {
            credential = cached; // already parsed JSON
        } else {
            // 2. Fallback to DB lookup
            credential = await ApiCredential.findOne({
                apiKey,
                isActive: true,
            }).lean();

            if (!credential) {
                return res.status(401).json({ message: "Invalid API key" });
            }

            // 3. Cache in Upstash (expires in 3600 seconds)
            await redis.setex(redisKey, 3600, credential);
        }

        // 4. Compare secret
        const valid = await bcrypt.compare(apiSecret, credential.apiSecretHash);
        if (!valid) {
            return res.status(401).json({ message: "Invalid API secret" });
        }

        // 5. Load user
        const user = await User.findById(credential.user).lean();
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        req.apiCredential = credential;

        // 6. Update lastUsedAt (don't await it)
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
