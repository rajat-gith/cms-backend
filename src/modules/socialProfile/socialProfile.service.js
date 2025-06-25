// socialProfile.service.js
const SocialProfile = require("./socialProfile.model");

const SocialProfileService = {
    async create(userId, data) {
        return await SocialProfile.create({ userId: userId, ...data });
    },

    async update(profileId, data) {
        return await SocialProfile.findByIdAndUpdate(profileId, data, {
            new: true,
            runValidators: true,
        });
    },

    async getSocialProfilesByUser(userId) {
        return await SocialProfile.find({ userId });
    },

    async getById(profileId) {
        return await SocialProfile.findById(profileId);
    },

    async delete(profileId) {
        return await SocialProfile.findByIdAndDelete(profileId);
    },
};

module.exports = SocialProfileService;
