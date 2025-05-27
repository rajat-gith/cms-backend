const CertificationService = require("./certification.service");

const CertificationController = {
	async add(req, res) {
		try {
			const payload = {
				...req.body,
				userId: req.user.userId,
			};
			const cert = await CertificationService.addCertification(payload);
			res.status(201).json({ message: "Certification added", cert });
		} catch (err) {
			res.status(500).json({
				message: "Failed to add certification",
				error: err.message,
			});
		}
	},

	async getAll(req, res) {
		try {
			const certs = await CertificationService.getUserCertifications(
				req.user.userId
			);
			res.json(certs);
		} catch (err) {
			res.status(500).json({
				message: "Failed to fetch certifications",
				error: err.message,
			});
		}
	},

	async update(req, res) {
		try {
			const updated = await CertificationService.updateCertification(
				req.params.id,
				req.body
			);
			res.json({ message: "Updated successfully", updated });
		} catch (err) {
			res.status(500).json({
				message: "Failed to update certification",
				error: err.message,
			});
		}
	},

	async delete(req, res) {
		try {
			await CertificationService.deleteCertification(req.params.id);
			res.json({ message: "Deleted successfully" });
		} catch (err) {
			res.status(500).json({
				message: "Failed to delete certification",
				error: err.message,
			});
		}
	},

	async getById(req, res) {
		try {
			const cert = await CertificationService.getCertificationById(
				req.params.id
			);
			if (!cert)
				return res
					.status(404)
					.json({ message: "Certification not found" });
			res.json(cert);
		} catch (err) {
			res.status(500).json({
				message: "Error fetching certification",
				error: err.message,
			});
		}
	},
};

module.exports = CertificationController;
