const jwt = require("jsonwebtoken");
const config = require("../../config");
const { z } = require("zod");
const UserService = require("../user/user.service");

const authSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const validateAuthenticationToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res
			.status(401)
			.json({ message: "Authentication token required." });
	}

	try {
		const decoded = jwt.verify(token, config.jwt.secret);
		const user = await UserService.getUserById(decoded.userId);

		if (!user) {
			return res
				.status(403)
				.json({ message: "Invalid or expired token." });
		}

		req.user = user;
		next();
	} catch (err) {
		console.error("JWT Verification Error:", err.message);
		return res.status(403).json({ message: "Invalid or expired token." });
	}
};

const validateRegister = (req, res, next) => {
	try {
		authSchema.parse(req.body);
		next();
	} catch (error) {
		return res
			.status(400)
			.json({ message: "Validation error", errors: error.errors });
	}
};

const validateLogin = validateRegister;

module.exports = {
	validateAuthenticationToken,
	validateRegister,
	validateLogin,
};
