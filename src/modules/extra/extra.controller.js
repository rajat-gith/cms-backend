const {
	AwardHonorService,
	VolunteeringService,
	ExtracurricularService,
	InterestService,
	LanguageService,
} = require("./extra.service");

class ExtraController {
	static async addLanguage(req, res) {
		try {
			const result = await LanguageService.create({
				...req.body,
				userId: req.user.userId,
			});
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async getLanguages(req, res) {
		try {
			const result = await LanguageService.findByUser(req.user.userId);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async updateLanguage(req, res) {
		try {
			const result = await LanguageService.update(
				req.params.id,
				req.body
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async addExtracurricular(req, res) {
		try {
			const result = await ExtracurricularService.create({
				...req.body,
				userId: req.user.userId,
			});
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async getExtracurriculars(req, res) {
		try {
			const result = await ExtracurricularService.findByUser(
				req.user.userId
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async updateExtracurricular(req, res) {
		try {
			const result = await ExtracurricularService.update(
				req.params.id,
				req.body
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async addVolunteering(req, res) {
		try {
			const result = await VolunteeringService.create({
				...req.body,
				userId: req.user.userId,
			});
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async getVolunteerings(req, res) {
		try {
			const result = await VolunteeringService.findByUser(
				req.user.userId
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async updateVolunteering(req, res) {
		try {
			const result = await VolunteeringService.update(
				req.params.id,
				req.body
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async addInterest(req, res) {
		try {
			const result = await InterestService.create({
				...req.body,
				userId: req.user.userId,
			});
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async getInterests(req, res) {
		try {
			const result = await InterestService.findByUser(req.user.userId);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async updateInterest(req, res) {
		try {
			const result = await InterestService.update(
				req.params.id,
				req.body
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async addAwardHonor(req, res) {
		try {
			const result = await AwardHonorService.create({
				...req.body,
				userId: req.user.userId,
			});
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async getAwardHonors(req, res) {
		try {
			const result = await AwardHonorService.findByUser(req.user.userId);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}

	static async updateAwardHonor(req, res) {
		try {
			const result = await AwardHonorService.update(
				req.params.id,
				req.body
			);
			res.status(200).json(result);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
}

module.exports = ExtraController;
