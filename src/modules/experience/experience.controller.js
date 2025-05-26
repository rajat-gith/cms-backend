const ExperienceService = require("./experience.service");

const ExperienceController = {
	async addExperience(req, res) {
		try {
			const data = { ...req.body, userId: req.user.userId };
			const result = await ExperienceService.addExperience(data);
			res.status(201).json(result);
		} catch (error) {
			res.status(500).json({
				message: "Failed to create experience",
				error: error.message,
			});
		}
	},

	async getExperiences(req, res) {
		try {
			const experiences = await ExperienceService.getExperiencesByUser(
				req.user.userId
			);
			res.status(200).json(experiences);
		} catch (error) {
			res.status(500).json({
				message: "Failed to retrieve experiences",
				error: error.message,
			});
		}
	},

	async updateExperience(req, res) {
		try {
			const { id } = req.params;
			const updated = await ExperienceService.updateExperience(
				id,
				req.body
			);
			res.status(200).json(updated);
		} catch (error) {
			res.status(500).json({
				message: "Failed to update experience",
				error: error.message,
			});
		}
	},

	async deleteExperience(req, res) {
		try {
			const { id } = req.params;
			await ExperienceService.deleteExperience(id);
			res.status(204).send();
		} catch (error) {
			res.status(500).json({
				message: "Failed to delete experience",
				error: error.message,
			});
		}
	},
};

module.exports = ExperienceController;
