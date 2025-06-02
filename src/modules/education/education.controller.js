const EducationService = require("./education.service");

class EducationController {
	static async addEducation(req, res) {
		try {
			const data = { ...req.body, userId: req.user.userId };
			console.log(data);
			const edu = await EducationService.createEducation(data);
			res.status(201).json(edu);
		} catch (err) {
			res.status(500).json({
				message: "Failed to create education",
				error: err.message,
			});
		}
	}

	static async getEducations(req, res) {
		try {
			const eduList = await EducationService.getEducationsByUser(
				req.user.userId
			);
			res.status(200).json(eduList);
		} catch (err) {
			res.status(500).json({
				message: "Failed to get education",
				error: err.message,
			});
		}
	}

	static async updateEducation(req, res) {
		try {
			const edu = await EducationService.updateEducation(
				req.params.id,
				req.user.userId,
				req.body
			);
			if (!edu)
				return res
					.status(404)
					.json({ message: "Education not found or not authorized" });
			res.status(200).json(edu);
		} catch (err) {
			res.status(500).json({
				message: "Failed to update education",
				error: err.message,
			});
		}
	}
	static async deleteEducation(req, res) {
		try {
			await EducationService.deleteEducation(req.params.id);
			res.json({ message: "Deleted successfully" });
		} catch (err) {
			res.status(500).json({
				message: "Failed to delete certification",
				error: err.message,
			});
		}
	}
}

module.exports = EducationController;
