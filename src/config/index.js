require("dotenv").config();

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

module.exports = {
	port: process.env.PORT || 5000,

	postgresUri: process.env.POSTGRES_URI,

	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		redirectUri: process.env.GOOGLE_REDIRECT_URI,
	},

	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || "1h",
	},

	redis: {
		url: process.env.UPSTASH_REDIS_REST_URL,
		token: process.env.UPSTASH_REDIS_REST_TOKEN,
	},

	rabbitmq: {
		url: process.env.RABBITMQ_URL || "amqp://localhost",
	},

	email: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
		from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
	},

	frontendDevUrl: process.env.FRONTEND_DEV_URL || "http://localhost:3000",
	frontendDeployedUrl: process.env.FRONTEND_DEPLOYED_URL || "",

	nodeEnv: process.env.NODE_ENV || "development",
};
