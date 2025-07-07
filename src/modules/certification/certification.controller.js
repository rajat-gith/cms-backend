const CertificationService = require("./certification.service");

const CertificationController = {
	async add(req, res) {
		try {
			const payload = {
				...req.body,
				userId: req.user.userId,
			};
			const cert = await CertificationService.addCertification(payload);
			res.status(201).json({
				message: "Certification added successfully",
				data: cert,
			});
		} catch (err) {
			console.error("Error adding certification:", err);
			res.status(500).json({
				message: "Failed to add certification",
				error: err.message,
			});
		}
	},

	async getAll(req, res) {
		try {
			const certs = await CertificationService.getCertificationsByUser(
				req.user.userId
			);
			res.json({
				message: "Certifications retrieved successfully",
				data: certs,
			});
		} catch (err) {
			console.error("Error fetching certifications:", err);
			res.status(500).json({
				message: "Failed to fetch certifications",
				error: err.message,
			});
		}
	},

	async update(req, res) {
		try {
			// Check if certification belongs to the user
			const existingCert =
				await CertificationService.getCertificationByIdAndUser(
					req.params._id,
					req.user.userId
				);

			if (!existingCert) {
				return res.status(404).json({
					message:
						"Certification not found or you don't have permission to update it",
				});
			}

			const updated = await CertificationService.updateCertification(
				req.params._id,
				req.body
			);

			res.json({
				message: "Certification updated successfully",
				data: updated,
			});
		} catch (err) {
			console.error("Error updating certification:", err);
			res.status(500).json({
				message: "Failed to update certification",
				error: err.message,
			});
		}
	},

	async delete(req, res) {
		try {
			// Check if certification belongs to the user
			const existingCert =
				await CertificationService.getCertificationByIdAndUser(
					req.params._id,
					req.user.userId
				);

			if (!existingCert) {
				return res.status(404).json({
					message:
						"Certification not found or you don't have permission to delete it",
				});
			}

			await CertificationService.deleteCertification(req.params._id);
			res.json({ message: "Certification deleted successfully" });
		} catch (err) {
			console.error("Error deleting certification:", err);
			res.status(500).json({
				message: "Failed to delete certification",
				error: err.message,
			});
		}
	},

	async getById(req, res) {
		try {
			const cert = await CertificationService.getCertificationByIdAndUser(
				req.params._id,
				req.user.userId
			);

			if (!cert) {
				return res.status(404).json({
					message: "Certification not found",
				});
			}

			res.json({
				message: "Certification retrieved successfully",
				data: cert,
			});
		} catch (err) {
			console.error("Error fetching certification:", err);
			res.status(500).json({
				message: "Error fetching certification",
				error: err.message,
			});
		}
	},

	async getExpired(req, res) {
		try {
			const certs = await CertificationService.getExpiredCertifications(
				req.user.userId
			);
			res.json({
				message: "Expired certifications retrieved successfully",
				data: certs,
			});
		} catch (err) {
			console.error("Error fetching expired certifications:", err);
			res.status(500).json({
				message: "Failed to fetch expired certifications",
				error: err.message,
			});
		}
	},

	async getActive(req, res) {
		try {
			const certs = await CertificationService.getActiveCertifications(
				req.user.userId
			);
			res.json({
				message: "Active certifications retrieved successfully",
				data: certs,
			});
		} catch (err) {
			console.error("Error fetching active certifications:", err);
			res.status(500).json({
				message: "Failed to fetch active certifications",
				error: err.message,
			});
		}
	},

	async getByCategory(req, res) {
		try {
			const { category } = req.params;
			const certs =
				await CertificationService.getCertificationsByCategory(
					req.user.userId,
					category
				);
			res.json({
				message: `Certifications in category '${category}' retrieved successfully`,
				data: certs,
			});
		} catch (err) {
			console.error("Error fetching certifications by category:", err);
			res.status(500).json({
				message: "Failed to fetch certifications by category",
				error: err.message,
			});
		}
	},

	async search(req, res) {
		try {
			const { q } = req.query;
			if (!q) {
				return res.status(400).json({
					message: "Search query parameter 'q' is required",
				});
			}

			const certs = await CertificationService.searchCertifications(
				req.user.userId,
				q
			);
			res.json({
				message: "Search completed successfully",
				data: certs,
			});
		} catch (err) {
			console.error("Error searching certifications:", err);
			res.status(500).json({
				message: "Failed to search certifications",
				error: err.message,
			});
		}
	},
};

module.exports = CertificationController;
