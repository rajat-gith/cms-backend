const Language = require("./models/language.model");
const Interest = require("./models/interest.model");
const AwardHonor = require("./models/awardHonor.model");
const Extracurricular = require("./models/extracurricular.model");
const Volunteering = require("./models/volunteering.model");



class VolunteeringService {
	static async create(data) {
		const volunteer = new Volunteering(data);
		return await volunteer.save();
	}

	static async findByUser(userId) {
		return await Volunteering.find({ userId });
	}

	static async update(id, updates) {
		return await Volunteering.findByIdAndUpdate(id, updates, { new: true });
	}
}

class InterestService {
	static async create(data) {
		const interest = new Interest(data);
		return await interest.save();
	}

	static async findByUser(userId) {
		return await Interest.find({ userId });
	}

	static async update(id, updates) {
		return await Interest.findByIdAndUpdate(id, updates, { new: true });
	}
}

class AwardHonorService {
	static async create(data) {
		const award = new AwardHonor(data);
		return await award.save();
	}

	static async findByUser(userId) {
		return await AwardHonor.find({ userId });
	}

	static async update(id, updates) {
		return await AwardHonor.findByIdAndUpdate(id, updates, { new: true });
	}
}

class LanguageService {
	static async create(data) {
		const language = new Language(data);
		return await language.save();
	}

	static async findByUser(userId) {
		return await Language.find({ userId });
	}

	static async update(id, updates) {
		return await Language.findByIdAndUpdate(id, updates, { new: true });
	}
}

class ExtracurricularService {
	static async create(data) {
		const activity = new Extracurricular(data);
		return await activity.save();
	}

	static async findByUser(userId) {
		return await Extracurricular.find({ userId });
	}

	static async update(id, updates) {
		return await Extracurricular.findByIdAndUpdate(id, updates, {
			new: true,
		});
	}
}

module.exports = {
	AwardHonorService,
	VolunteeringService,
	ExtracurricularService,
	InterestService,
	LanguageService,
};
