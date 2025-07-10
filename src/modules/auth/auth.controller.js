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
			await AuthService.initiateRegistration(email, password);
			res.status(200).json({
				message: "OTP sent to your email. Please verify.",
			});
		} catch (error) {
			res.status(409).json({ message: error.message });
		}
	}

	static async verifyOTP(req, res) {
		const { email, otp } = req.body;
		try {
			const { user, token } = await AuthService.verifyEmailOTP(
				email,
				otp
			);
			res.status(201).json({
				message: "Registration successful",
				user,
				token,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	static async resendOtp(req, res) {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Email is required." });
		}

		try {
			await AuthService.resendOTP(email);
			res.status(200).json({ message: "OTP resent successfully." });
		} catch (error) {
			const status = error.message.includes("already sent") ? 429 : 500;
			res.status(status).json({ message: error.message });
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
