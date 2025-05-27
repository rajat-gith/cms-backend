const SocialProfileService = require("./socialProfile.service");

const SocialProfileController = {
	async upsertProfile(req, res) {
		try {
			const userId = req.user.userId;
			const profile = await SocialProfileService.createOrUpdate(
				userId,
				req.body
			);
			res.status(200).json({ message: "Profile saved", profile });
		} catch (error) {
			res.status(500).json({ message: "Error saving profile", error });
		}
	},

	async getProfile(req, res) {
		try {
			const userId = req.user.userId;
			const profile = await SocialProfileService.getByUserId(userId);
			if (!profile)
				return res.status(404).json({ message: "Profile not found" });
			res.json(profile);
		} catch (error) {
			res.status(500).json({ message: "Error fetching profile", error });
		}
	},
};

module.exports = SocialProfileController;
