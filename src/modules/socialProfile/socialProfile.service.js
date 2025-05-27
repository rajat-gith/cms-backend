const SocialProfile = require("./socialProfile.model");

class SocialProfileService {
	static async createOrUpdate(userId, data) {
		return await SocialProfile.findOneAndUpdate(
			{ userId },
			{ ...data, userId },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
	}

	static async getByUserId(userId) {
		return await SocialProfile.findOne({ userId });
	}

	static async delete(userId) {
		return await SocialProfile.findOneAndDelete({ userId });
	}
}

module.exports = SocialProfileService;
