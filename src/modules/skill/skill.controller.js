const SkillService = require("./skill.service");

const SkillController = {
	async addSkill(req, res) {
		try {
			const data = { ...req.body, userId: req.user.userId };
			const skill = await SkillService.addSkill(data);
			res.status(201).json({ message: "Skill added", skill });
		} catch (error) {
			res.status(500).json({ message: "Failed to add skill", error });
		}
	},

	async getSkills(req, res) {
		try {
			const skills = await SkillService.getSkills(req.user.userId);
			res.json(skills);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch skills", error });
		}
	},

	async updateSkill(req, res) {
		try {
			const updated = await SkillService.updateSkill(
				req.params.id,
				req.body
			);
			res.json(updated);
		} catch (error) {
			res.status(500).json({ message: "Failed to update skill", error });
		}
	},

	async deleteSkill(req, res) {
		try {
			await SkillService.deleteSkill(req.params.id);
			res.json({ message: "Skill deleted" });
		} catch (error) {
			res.status(500).json({ message: "Failed to delete skill", error });
		}
	},
};

module.exports = SkillController;
