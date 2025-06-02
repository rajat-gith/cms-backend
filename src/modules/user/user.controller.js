const UserService = require("./user.service");
const AuthService = require("../auth/auth.service");
const config = require("../../config");

class UserController {
	static async getProfile(req, res) {
		try {
			const user = await UserService.findUserById(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found." });
			}
			res.status(200).json({
				message: "User profile retrieved",
				data: user,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error retrieving profile.",
				error: error.message,
			});
		}
	}

	static async updateProfile(req, res) {
		try {
			const user = await UserService.findUserById(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found." });
			}

			const allowedUpdates = [
				"first_name",
				"middle_name",
				"last_name",
				"username",
				"linkedinURL",
				"githubURL",
				"otherLinks",
				"about",
				"profilePhoto",
				"location",
				"phone",
				"apiCredentials",
			];

			const updateData = {};

			for (const key of allowedUpdates) {
				if (req.body.hasOwnProperty(key)) {
					if (key === "apiCredentials") {
						const apiCreds = req.body[key];

						if (!Array.isArray(apiCreds)) {
							return res
								.status(400)
								.json({
									message: "apiCredentials must be an array.",
								});
						}

						// Basic validation – ensure each item has apiKey and a hashed apiSecret
						for (const cred of apiCreds) {
							if (!cred.apiKey || !cred.apiSecret) {
								return res
									.status(400)
									.json({
										message:
											"Each API credential must include both apiKey and apiSecret.",
									});
							}

							// Optional: Validate hash format (starts with $2b$ or $2a$)
							if (!cred.apiSecret.startsWith("$2")) {
								return res
									.status(400)
									.json({
										message:
											"apiSecret must be a bcrypt hash.",
									});
							}
						}

						updateData[key] = apiCreds; // No re-hashing needed
					} else {
						updateData[key] = req.body[key];
					}
				}
			}

			const updatedUser = await UserService.updateUser(user, updateData);

			res.status(200).json({
				message: "Profile updated successfully",
				data: updatedUser,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error updating profile.",
				error: error.message,
			});
		}
	}

	static async linkGoogleAccount(req, res) {
		const { code } = req.body;
		if (!code) {
			return res
				.status(400)
				.json({ message: "Authorization code is missing." });
		}
		try {
			const { tokens } = await AuthService.oAuth2Client.getToken(code);
			AuthService.oAuth2Client.setCredentials(tokens);
			const ticket = await AuthService.oAuth2Client.verifyIdToken({
				idToken: tokens.id_token,
				audience: config.google.clientId,
			});
			const payload = ticket.getPayload();

			const googleId = payload.sub;
			const googleEmail = payload.email;

			const currentUser = await UserService.findUserById(req.user.userId);
			if (!currentUser) {
				return res
					.status(404)
					.json({ message: "Authenticated user not found." });
			}

			const existingUserWithGoogleId =
				await UserService.findUserByGoogleId(googleId);
			if (
				existingUserWithGoogleId &&
				existingUserWithGoogleId._id.toString() !==
					currentUser._id.toString()
			) {
				return res.status(409).json({
					message:
						"This Google account is already linked to another user.",
				});
			}

			if (currentUser.email !== googleEmail) {
				console.warn(
					`User ${currentUser.email} linking Google ID with different email ${googleEmail}`
				);
			}

			if (currentUser.googleId && currentUser.googleId === googleId) {
				return res.status(200).json({
					message: "Google account already linked.",
					data: currentUser,
				});
			}

			const updatedUser = await UserService.updateUser(currentUser, {
				googleId: googleId,
				profilePicture: payload.picture,
			});
			res.status(200).json({
				message: "Google account linked successfully!",
				data: updatedUser,
			});
		} catch (error) {
			console.error("Error linking Google account:", error);
			res.status(500).json({
				message: "Failed to link Google account.",
				error: error.message,
			});
		}
	}

	static async unlinkGoogleAccount(req, res) {
		try {
			const currentUser = await UserService.findUserById(req.user.userId);
			if (!currentUser) {
				return res
					.status(404)
					.json({ message: "Authenticated user not found." });
			}

			if (!currentUser.googleId) {
				return res.status(400).json({
					message: "No Google account is linked to this user.",
				});
			}

			// Check if user has a password set for email/password login
			const userWithPassword = await UserService.findUserById(
				req.user.userId
			); // Re-fetch to include password check
			if (!userWithPassword || !userWithPassword.password) {
				// Check the .password property which would be populated if set
				return res.status(400).json({
					message:
						"Please set a password before unlinking your Google account to ensure you can still sign in with email/password.",
				});
			}

			const updatedUser = await UserService.updateUser(currentUser, {
				googleId: null,
				profilePicture: null,
			});
			res.status(200).json({
				message: "Google account unlinked successfully!",
				data: updatedUser,
			});
		} catch (error) {
			console.error("Error unlinking Google account:", error);
			res.status(500).json({
				message: "Failed to unlink Google account.",
				error: error.message,
			});
		}
	}
}

module.exports = UserController;
