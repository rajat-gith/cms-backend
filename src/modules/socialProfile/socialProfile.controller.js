const SocialProfileService = require("./socialProfile.service");

const SocialProfileController = {
    // Create profile
    async createProfile(req, res) {
        try {
			console.log(req.user)
            const userId = req.user.userId; // assume user is authenticated
            const socialProfile = await SocialProfileService.create(userId, req.body);
            res.status(201).json({ message: "Profile created", socialProfile });
        } catch (error) {
            res.status(500).json({ message: "Error creating profile", error });
        }
    },

    // Update profile
    async updateProfile(req, res) {
        try {
            const profileId = req.params.id;
            const updated = await SocialProfileService.update(
                profileId,
                req.body
            );
            if (!updated) {
                return res.status(404).json({ message: "Profile not found" });
            }
            res.status(200).json({
                message: "Profile updated",
                socialProfile: updated,
            });
        } catch (error) {
            res.status(500).json({ message: "Error updating profile", error });
        }
    },

    // Get profile by ID
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await SocialProfileService.getSocialProfilesByUser(
                userId
            );
            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }
            res.status(200).json(profile);
        } catch (error) {
            res.status(500).json({ message: "Error fetching profile", error });
        }
    },

    // Optional: Delete
    async deleteProfile(req, res) {
        try {
            const profileId = req.params.id;
            await SocialProfileService.delete(profileId);
            res.status(200).json({ message: "Profile deleted" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting profile", error });
        }
    },
};

module.exports = SocialProfileController;
