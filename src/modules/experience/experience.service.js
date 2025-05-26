const Experience = require("./experience.model");

class ExperienceService {
	static async addExperience(data) {
		const experience = new Experience(data);
		return await experience.save();
	}

	static async getExperiencesByUser(userId) {
		return await Experience.find({ userId }).sort({ startDate: -1 });
	}

	static async updateExperience(id, updates) {
		return await Experience.findByIdAndUpdate(id, updates, { new: true });
	}

	static async deleteExperience(id) {
		return await Experience.findByIdAndDelete(id);
	}
}

module.exports = ExperienceService;
