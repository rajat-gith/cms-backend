const pool = require("../../db/index");
const queries = require("./certification.queries");

class CertificationService {
	static async addCertification(data) {
		const {
			name,
			issuingOrganization,
			issueDate,
			expirationDate,
			credentialId,
			credentialURL,
			category,
			skills,
			userId,
		} = data;

		const formattedIssueDate = new Date(issueDate);
		const formattedExpirationDate = expirationDate
			? new Date(expirationDate)
			: null;
		const isExpired = !expirationDate;

		const client = await pool.connect();
		try {
			const result = await client.query(queries._addCertification(), [
				name,
				issuingOrganization,
				formattedIssueDate,
				formattedExpirationDate,
				isExpired,
				credentialId,
				credentialURL,
				category,
				skills,
				userId,
			]);
			return result.rows[0];
		} finally {
			client.release();
		}
	}

	static async getCertificationsByUser(userId) {
		const client = await pool.connect();
		try {
			const result = await client.query(
				queries._getCertificationsByUser(),
				[userId]
			);
			return result.rows;
		} finally {
			client.release();
		}
	}

	static async updateCertification(certId, updates) {
		const {
			name,
			issuingOrganization,
			issueDate,
			expirationDate,
			isExpired,
			credentialId,
			credentialURL,
			category,
			skills,
		} = updates;

		const formattedIssueDate = issueDate ? new Date(issueDate) : null;
		const formattedExpirationDate = expirationDate
			? new Date(expirationDate)
			: null;

		const client = await pool.connect();
		try {
			const result = await client.query(queries._updateCertification(), [
				certId,
				name,
				issuingOrganization,
				formattedIssueDate,
				formattedExpirationDate,
				isExpired,
				credentialId,
				credentialURL,
				category,
				skills,
			]);
			return result.rows[0];
		} finally {
			client.release();
		}
	}

	static async deleteCertification(certId) {
		const client = await pool.connect();
		try {
			const result = await client.query(queries._deleteCertification(), [
				certId,
			]);
			return result.rows[0];
		} finally {
			client.release();
		}
	}

	static async getCertificationById(certId) {
		const client = await pool.connect();
		try {
			const result = await client.query(queries._getCertificationById(), [
				certId,
			]);
			return result.rows[0];
		} finally {
			client.release();
		}
	}

	static async getCertificationByIdAndUser(certId, userId) {
		const client = await pool.connect();
		try {
			const result = await client.query(
				queries._getCertificationByIdAndUser(),
				[certId, userId]
			);
			return result.rows[0];
		} finally {
			client.release();
		}
	}

	static async getExpiredCertifications(userId) {
		const client = await pool.connect();
		try {
			const result = await client.query(
				queries._getExpiredCertifications(),
				[userId]
			);
			return result.rows;
		} finally {
			client.release();
		}
	}

	static async getActiveCertifications(userId) {
		const client = await pool.connect();
		try {
			const result = await client.query(
				queries._getActiveCertifications(),
				[userId]
			);
			return result.rows;
		} finally {
			client.release();
		}
	}

	static async getCertificationsByCategory(userId, category) {
		const client = await pool.connect();
		try {
			const result = await client.query(
				queries._getCertificationsByCategory(),
				[userId, category]
			);
			return result.rows;
		} finally {
			client.release();
		}
	}

	static async searchCertifications(userId, searchTerm) {
		const client = await pool.connect();
		try {
			const result = await client.query(queries._searchCertifications(), [
				userId,
				searchTerm,
			]);
			return result.rows;
		} finally {
			client.release();
		}
	}
}

module.exports = CertificationService;