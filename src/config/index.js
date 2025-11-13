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
	frontendDevUrl: process.env.FRONTEND_DEV_URL || "",
	frontendDeployedUrl: process.env.FRONTEND_DEPLOYED_URL || "",
};
