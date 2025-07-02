const AuthService = require("./auth.service");

class AuthController {
	static async register(req, res) {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required." });
		}

		try {
			const name = email.split("@")[0];
			const username = name;
			const { user, token } = await AuthService.registerUser(
				email,
				name,
				username,
				password
			);
			res.status(201).json({
				message: "Registration successful",
				user,
				token,
			});
		} catch (error) {
			res.status(409).json({ message: error.message });
		}
	}

	static async login(req, res) {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required." });
		}

		try {
			const { user, token } = await AuthService.loginUser(
				email,
				password
			);
			res.status(200).json({ message: "Login successful", user, token });
		} catch (error) {
			res.status(401).json({ message: error.message });
		}
	}

	static async googleAuthCallback(req, res) {
		try {
			const { code } = req.body;

			if (!code) {
				return res.status(400).json({
					success: false,
					message: "Authorization code is required",
				});
			}

			const { user, token } = await AuthService.handleGoogleAuth(code);

			res.json({
				success: true,
				message: "Google authentication successful",
				user,
				token,
			});
		} catch (error) {
			res.status(401).json({
				success: false,
				message: error.message,
			});
		}
	}
}

module.exports = AuthController;
