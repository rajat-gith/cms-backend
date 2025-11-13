require("dotenv").config();

module.exports = {
	port: process.env.PORT || 5000,

	postgresUri: process.env.POSTGRES_URI,

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
		ssl: {
			ca: process.env.PG_CA,
			rejectUnauthorized: true,
		},
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

	aws: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION || "us-east-1",
	},

	frontendDevUrl: process.env.FRONTEND_DEV_URL || "http://localhost:3000",
	frontendDeployedUrl: process.env.FRONTEND_DEPLOYED_URL || "",

	nodeEnv: process.env.NODE_ENV || "development",
};
