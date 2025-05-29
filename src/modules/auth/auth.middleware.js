const jwt = require("jsonwebtoken");
const config = require("../../config");
const { authSchema } = require("./auth.validation");
const UserService = require("../user/user.service");

const validateAuthenticationToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res
			.status(401)
			.json({ message: "Authentication token required." });
	}

	jwt.verify(token, config.jwt.secret, (err, user) => {
		if (err) {
			console.error("JWT Verification Error:", err.message);
			return res
				.status(403)
				.json({ message: "Invalid or expired token." });
		}
		req.user = user;
		next();
	});
};

const validateAPICreds = async (req, res, next) => {
	const userApiKey = req.headers["x-api-key"];
	const userApiSecret = req.headers["x-api-secret"];

	if (!userApiKey || !userApiSecret) {
		return res.status(401).json({ message: "API credentials required." });
	}
	try {
		const user = await UserService.findUserByAPIKey([
			{ apiKey: userApiKey, apiSecret: userApiSecret },
		]);
		console.log(user);
		if (!user) {
			return res
				.status(403)
				.json({ message: "Invalid API credentials." });
		}

		req.user = user;
		next();
	} catch (err) {
		console.error("Error validating API credentials:", err);
		res.status(500).json({ message: "Internal server error" });
	}
};

const validateRegister = (req, res, next) => {
	try {
		authSchema.parse(req.body);
		next();
	} catch (error) {
		return res.status(400).json({
			message: "Validation error",
			errors: error.errors,
		});
	}
};

const validateLogin = (req, res, next) => {
	try {
		authSchema.parse(req.body);
		next();
	} catch (error) {
		return res.status(400).json({
			message: "Validation error",
			errors: error.errors,
		});
	}
};
module.exports = {
	validateAuthenticationToken,
	validateRegister,
	validateLogin,
	validateAPICreds,
};
