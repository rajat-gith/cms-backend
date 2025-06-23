const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const { OAuth2Client } = require("google-auth-library");
const UserService = require("../user/user.service"); // Import user service

const oAuth2Client = new OAuth2Client(
	config.google.clientId,
	config.google.clientSecret,
	config.google.redirectUri
);

class AuthService {
	static async registerUser(email, name, username, password) {
		const existingUser = await UserService.findUserByEmail(email);
		if (existingUser) {
			throw new Error("User with this email already exists.");
		}
		const user = await UserService.createUser({
			email,
			name,
			username,
			password,
		});
		return this.generateAuthToken(user);
	}

	static async loginUser(email, password) {
		const user = await UserService.findUserByEmail(email);
		if (!user || !user.password) {
			throw new Error("Invalid credentials");
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new Error("Invalid credentials.");
		}
		return this.generateAuthToken(user);
	}

	static async handleGoogleAuth(authCode) {
		try {
			if (!authCode) {
				throw new Error("Authorization code is required");
			}

			const { tokens } = await oAuth2Client.getToken(authCode);
			if (!tokens.id_token) {
				throw new Error("Invalid token response from Google");
			}

			const ticket = await oAuth2Client.verifyIdToken({
				idToken: tokens.id_token,
				audience: config.google.clientId,
			});

			const payload = ticket.getPayload();
			if (!payload.email_verified) {
				throw new Error("Google email not verified");
			}

			const {
				sub: googleId,
				email,
				name = "User",
				picture: profilePicture,
			} = payload;

			let user = await UserService.findUserByGoogleId(googleId);
			//here the logic is it will check the user incoming has already created account or not.

			if (!user) {
				const existingUser = await UserService.findUserByEmail(email);

				if (existingUser) {
					// Allow linking Google account only if:
					// 1. The user does not have a googleId yet (first time linking), OR
					// 2. The existing googleId matches the current one (same account).
					// Otherwise, block linking to prevent different Google accounts from using the same email.
					if (
						existingUser.googleId &&
						existingUser.googleId !== googleId
					) {
						throw new Error(
							"Email already linked to different Google account"
						);
					}

					user = await UserService.updateUser(existingUser._id, {
						googleId,
						profilePicture:
							profilePicture || existingUser.profilePicture,
					});
				} else {
					// Create new user
					user = await UserService.createUser({
						email,
						name,
						googleId,
						profilePicture,
					});
				}
			}

			// 5. Generate JWT
			return this.generateAuthToken(user);
		} catch (error) {
			console.error("Google authentication error:", error);
			throw new Error(`Google authentication failed: ${error.message}`);
		}
	}

	static generateAuthToken(user) {
		const userObj = user.toObject?.() || user;
		const { password, ...userWithoutPassword } = userObj;

		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
				authMethod: user.password ? "email" : "google",
			},
			config.jwt.secret,
			{ expiresIn: config.jwt.expiresIn }
		);

		return {
			user: userWithoutPassword,
			token,
			authMethod: user.password ? "email" : "google",
		};
	}
}

module.exports = AuthService;
