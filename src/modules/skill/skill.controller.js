const SkillService = require("./skill.service");

const SkillController = {
	async addSkill(req, res) {
		try {
			const data = { ...req.body, userId: req.user.userId };
			const skill = await SkillService.addSkill(data);
			res.status(201).json({
				message: "Skill added successfully",
				data: skill,
			});
		} catch (error) {
			console.error("Error adding skill:", error);
			if (error.message === "User not found") {
				return res.status(404).json({
					message: "User not found",
				});
			}
			res.status(500).json({
				message: "Failed to add skill",
				error: error.message,
			});
		}
	},

	async getSkills(req, res) {
		try {
			const skills = await SkillService.getSkillsByUser(req.user.userId);
			res.json({
				message: "Skills retrieved successfully",
				data: skills,
			});
		} catch (error) {
			console.error("Error fetching skills:", error);
			res.status(500).json({
				message: "Failed to fetch skills",
				error: error.message,
			});
		}
	},

	async getSkillById(req, res) {
		try {
			const skill = await SkillService.getSkillByIdAndUser(
				req.params.id,
				req.user.userId
			);
			if (!skill) {
				return res.status(404).json({
					message: "Skill not found",
				});
			}
			res.json({
				message: "Skill retrieved successfully",
				data: skill,
			});
		} catch (error) {
			console.error("Error fetching skill:", error);
			res.status(500).json({
				message: "Failed to fetch skill",
				error: error.message,
			});
		}
	},

	async updateSkill(req, res) {
		try {
			const updated = await SkillService.updateSkill(
				req.params.id,
				req.body,
				req.user.userId
			);
			res.json({
				message: "Skill updated successfully",
				data: updated,
			});
		} catch (error) {
			console.error("Error updating skill:", error);
			if (error.message === "Skill not found or access denied") {
				return res.status(404).json({
					message: "Skill not found or access denied",
				});
			}
			res.status(500).json({
				message: "Failed to update skill",
				error: error.message,
			});
		}
	},

	async deleteSkill(req, res) {
		try {
			await SkillService.deleteSkill(req.params.id, req.user.userId);
			res.json({
				message: "Skill deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting skill:", error);
			if (error.message === "Skill not found or access denied") {
				return res.status(404).json({
					message: "Skill not found or access denied",
				});
			}
			res.status(500).json({
				message: "Failed to delete skill",
				error: error.message,
			});
		}
	},
};

module.exports = SkillController;
