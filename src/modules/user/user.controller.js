const UserService = require("./user.service");
const AuthService = require("../auth/auth.service");
const config = require("../../config");

class UserController {
	static async getProfile(req, res) {
		try {
			const user = await UserService.findUserById(req.user.id);
			if (!user) {
				return res.status(404).json({ message: "User not found." });
			}
			res.status(200).json({
				message: "User profile retrieved",
				data: user,
			});
		} catch (error) {
			console.error("Error retrieving profile:", error);
			res.status(500).json({
				message: "Error retrieving profile.",
				error: error.message,
			});
		}
	}

	static async updateProfile(req, res) {
		try {
			const user = await UserService.findUserById(req.user.id);
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
			];

			const updateData = {};

			for (const key of allowedUpdates) {
				if (req.body.hasOwnProperty(key)) {
					updateData[key] = req.body[key];
				}
			}

			// Validate otherLinks structure if provided
			if (updateData.otherLinks) {
				if (!Array.isArray(updateData.otherLinks)) {
					return res.status(400).json({
						message: "otherLinks must be an array.",
					});
				}

				for (const link of updateData.otherLinks) {
					if (!link.platform || !link.url) {
						return res.status(400).json({
							message:
								"Each link must include both platform and url.",
						});
					}
				}
			}

			// Validate location structure if provided
			if (
				updateData.location &&
				typeof updateData.location !== "object"
			) {
				return res.status(400).json({
					message: "Location must be an object.",
				});
			}

			const updatedUser = await UserService.updateUser(user, updateData);

			res.status(200).json({
				message: "Profile updated successfully",
				data: updatedUser,
			});
		} catch (error) {
			console.error("Error updating profile:", error);
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

			const currentUser = await UserService.findUserById(req.user.id);
			if (!currentUser) {
				return res
					.status(404)
					.json({ message: "Authenticated user not found." });
			}

			const existingUserWithGoogleId =
				await UserService.findUserByGoogleId(googleId);
			if (
				existingUserWithGoogleId &&
				existingUserWithGoogleId.id !== currentUser.id
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

			const updatedUser = await UserService.updateGoogleAccount(
				currentUser.id,
				googleId,
				payload.picture
			);

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
			const currentUser = await UserService.findUserById(req.user.id);
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
			const passwordCheck = await UserService.checkUserPassword(
				req.user.id
			);
			if (!passwordCheck || !passwordCheck.has_password) {
				return res.status(400).json({
					message:
						"Please set a password before unlinking your Google account to ensure you can still sign in with email/password.",
				});
			}

			const updatedUser = await UserService.unlinkGoogleAccount(
				currentUser.id
			);

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
