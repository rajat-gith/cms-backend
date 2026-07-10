require("dotenv").config();

module.exports = {
	port: process.env.PORT || 5000,
	mongoUri: process.env.MONGO_URI,
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		redirectUri: process.env.GOOGLE_REDIRECT_URI,
	},
	db: {
		user: process.env.PG_USER,
		host: process.env.PG_HOST,
		database: process.env.PG_DB,
		password: process.env.PG_PASS,
		port: process.env.PG_PORT || 5432,
		ssl: process.env.PG_CA
			? {
					ca: process.env.PG_CA,
					rejectUnauthorized: true,
				}
			: false, // disables SSL locally if no CA provided
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: "1h",
	},
	apiRateLimit: {
		limitWindow: process.env.PUBLIC_RATE_LIMIT_WINDOW_SECONDS,
		limitMaxRequests: process.env.PUBLIC_RATE_LIMIT_MAX_REQUESTS,
	},
	frontendDevUrl: process.env.FRONTEND_DEV_URL || "",
	frontendDeployedUrl: process.env.FRONTEND_DEPLOYED_URL || "",
	aiCopilot: {
		baseUrl: process.env.AI_COPILOT_BASE_URL || "http://localhost:8000",
		syncCooldownMs: parseInt(
			process.env.AI_COPILOT_SYNC_COOLDOWN_MS || `${15 * 60 * 1000}`, // 15 min default
			10,
		),
		redisTtlSeconds: parseInt(
			process.env.AI_COPILOT_REDIS_TTL_SECONDS || `${60 * 60 * 24}`, // 24h default
			10,
		),
		requestTimeoutMs: parseInt(
			process.env.AI_COPILOT_REQUEST_TIMEOUT_MS || "60000",
			10,
		),
	},
};
