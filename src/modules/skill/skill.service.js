const Skill = require("./skill.model");

class SkillService {
	static async addSkill(data) {
		const skill = new Skill(data);
		return await skill.save();
	}

	static async getSkills(userId) {
		return await Skill.find({ userId });
	}

	static async updateSkill(skillId, updates) {
		return await Skill.findByIdAndUpdate(skillId, updates, { new: true });
	}

	static async deleteSkill(skillId) {
		return await Skill.findByIdAndDelete(skillId);
	}
}

module.exports = SkillService;
