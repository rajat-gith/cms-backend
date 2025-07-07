const experienceQueries = require("./experience.queries");
const pool = require("../../db/index");

class ExperienceService {
	static async addExperience(data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const {
				userId,
				title,
				company,
				location,
				employmentType,
				period: { startDate, endDate, ongoing },
				description,
				technologiesUsed,
			} = data;

			const query = experienceQueries._addExperienceQuery();
			const values = [
				userId,
				title,
				company,
				location || null,
				employmentType,
				startDate,
				endDate || null,
				ongoing || false,
				description || null,
				technologiesUsed || [],
			];

			const result = await client.query(query, values);
			await client.query("COMMIT");
			return this.transformExperienceData(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async getExperiencesByUser(userId) {
		const client = await pool.connect();
		try {
			const query = experienceQueries._getExperiencesByUserQuery();
			const result = await client.query(query, [userId]);

			return result.rows.map((row) => this.transformExperienceData(row));
		} finally {
			client.release();
		}
	}

	static async updateExperience(_id, updates) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			// Check existence
			const checkQuery = experienceQueries._getExperienceByIdQuery();
			const checkResult = await client.query(checkQuery, [_id]);

			if (checkResult.rows.length === 0) {
				throw new Error("Experience not found");
			}

			const {
				title,
				company,
				location,
				employmentType,
				period,
				description,
				technologiesUsed,
			} = updates;

			const query = experienceQueries._updateExperienceQuery();
			const values = [
				title,
				company,
				location,
				employmentType,
				period?.startDate,
				period?.endDate,
				period?.ongoing,
				description,
				technologiesUsed,
				_id,
			];

			const result = await client.query(query, values);

			if (result.rows.length === 0) {
				throw new Error("Experience update failed");
			}

			await client.query("COMMIT");
			return this.transformExperienceData(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deleteExperience(_id) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const query = experienceQueries._deleteExperienceQuery();
			const result = await client.query(query, [_id]);

			if (result.rows.length === 0) {
				throw new Error("Experience not found");
			}

			await client.query("COMMIT");
			return this.transformExperienceData(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static transformExperienceData(row) {
		return {
			_id: row._id,
			userId: row.user_id,
			title: row.title,
			company: row.company,
			location: row.location,
			employmentType: row.employment_type,
			period: {
				startDate: row.start_date,
				endDate: row.end_date,
				ongoing: row.ongoing,
			},
			description: row.description,
			technologiesUsed: row.technologies_used,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}
}

module.exports = ExperienceService;
