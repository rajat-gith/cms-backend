const Certification = require("./certification.model");

class CertificationService {
	static async addCertification(data) {
		const cert = new Certification(data);
		return await cert.save();
	}

	static async getCertificationsByUser(userId) {
		return await Certification.find({ userId });
	}

	static async updateCertification(certId, updates) {
		return await Certification.findByIdAndUpdate(certId, updates, {
			new: true,
		});
	}

	static async deleteCertification(certId) {
		return await Certification.findByIdAndDelete(certId);
	}

	static async getCertificationById(certId) {
		return await Certification.findById(certId);
	}
}

module.exports = CertificationService;
