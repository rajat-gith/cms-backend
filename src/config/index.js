require("dotenv").config();

module.exports = {
	port: process.env.PORT || 5000,
	mongoUri: process.env.MONGO_URI,
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		redirectUri: process.env.GOOGLE_REDIRECT_URI,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: "1h",
	},
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
