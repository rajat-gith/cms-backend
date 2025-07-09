const SocialProfileService = require("./socialProfile.service");

const SocialProfileController = {
	// Create profile
	async createProfile(req, res) {
		try {
			const userId = req.user._id;
			const socialProfile = await SocialProfileService.create(
				userId,
				req.body
			);

			res.status(201).json({
				message: "Social Profile created",
				data: socialProfile,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error creating profile",
				error: error.message,
			});
		}
	},

	// Update profile
	async updateProfile(req, res) {
		try {
			const profileId = req.params._id;
			const userId = req.user._id;

			// Check ownership
			const ownsProfile = await SocialProfileService.checkOwnership(
				profileId,
				userId
			);
			if (!ownsProfile) {
				return res.status(403).json({
					message: "Access denied",
				});
			}

			const updated = await SocialProfileService.update(
				profileId,
				req.body
			);

			if (!updated) {
				return res.status(404).json({ message: "Profile not found" });
			}

			res.status(200).json({
				message: "Profile updated",
				data: updated,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error updating profile",
				error: error.message,
			});
		}
	},

	// Get current user's profiles
	async getProfile(req, res) {
		try {
			const userId = req.user._id;
			const profiles = await SocialProfileService.getSocialProfilesByUser(
				userId
			);

			res.status(200).json({
				message: "Profiles retrieved",
				data: profiles,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching profile",
				error: error.message,
			});
		}
	},

	// Get profile by _id
	async getProfileById(req, res) {
		try {
			const profileId = req.params._id;
			const profile = await SocialProfileService.getById(profileId);

			if (!profile) {
				return res.status(404).json({ message: "Profile not found" });
			}

			// Check if profile is public or user owns it
			const userId = req.user?.userId;
			if (!profile.isPublic && profile.userId !== userId) {
				return res.status(403).json({
					message: "Profile is private",
				});
			}

			res.status(200).json({
				message: "Profile retrieved",
				data: profile,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching profile",
				error: error.message,
			});
		}
	},

	// Get all public profiles
	async getPublicProfiles(req, res) {
		try {
			const profiles = await SocialProfileService.getAllPublicProfiles();

			res.status(200).json({
				message: "Public profiles retrieved",
				data: profiles,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching public profiles",
				error: error.message,
			});
		}
	},

	// Delete profile
	async deleteProfile(req, res) {
		try {
			const profileId = req.params._id;
			const userId = req.user._id;

			// Check ownership
			const ownsProfile = await SocialProfileService.checkOwnership(
				profileId,
				userId
			);
			if (!ownsProfile) {
				return res.status(403).json({
					message: "Access denied",
				});
			}

			const deleted = await SocialProfileService.delete(profileId);

			if (!deleted) {
				return res.status(404).json({ message: "Profile not found" });
			}

			res.status(200).json({
				message: "Profile deleted",
			});
		} catch (error) {
			res.status(500).json({
				message: "Error deleting profile",
				error: error.message,
			});
		}
	},

	// Get profiles by user _id
	async getProfilesByUserId(req, res) {
		try {
			const targetUserId = req.params.userId;
			const currentUserId = req.user?.userId;

			const profiles = await SocialProfileService.getSocialProfilesByUser(
				targetUserId
			);

			// Filter private profiles unless current user is owner
			const filteredProfiles = profiles.filter(
				(profile) =>
					profile.isPublic || profile.userId === currentUserId
			);

			res.status(200).json({
				message: "User profiles retrieved",
				data: filteredProfiles,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching user profiles",
				error: error.message,
			});
		}
	},
};

module.exports = SocialProfileController;
