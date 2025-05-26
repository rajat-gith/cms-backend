const Education = require("./education.model")

class EducationService {
	static async createEducation(data) {
		return await Education.create(data);
	}

	static async getEducationsByUser(userId) {
		return await Education.find({ userId });
	}

	static async updateEducation(id, userId, updates) {
		return await Education.findOneAndUpdate({ _id: id, userId }, updates, {
			new: true,
		});
	}
}


module.exports = EducationService;