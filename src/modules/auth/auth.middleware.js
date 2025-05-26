const jwt = require("jsonwebtoken");
const config = require("../../config");
const { authSchema } = require("./auth.validation");

const validateAuthenticationToken = (req, res, next) => {
	console.log(req.headers["authorization"]);
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
};
