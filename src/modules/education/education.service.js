const educationQueries = require("./education.queries");
const pool = require("../../db/index");

class EducationService {
	static mapRowToEducation(row) {
		if (!row) return null;
		return {
			_id: row._id,
			courseName: row.courseName,
			institute: row.institute,
			periodOfCourse: {
				startDate: row.startDate,
				endDate: row.endDate,
				isOngoing: row.isOngoing,
			},
			degree: row.degree,
			skills: row.skills,
			courseworks: row.courseworks,
			grades: {
				type: row.gradeType,
				value: row.gradeValue,
			},
			userId: row.userId,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	static async createEducation(data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const {
				courseName,
				institute,
				periodOfCourse: { startDate, endDate, isOngoing },
				degree,
				skills,
				courseworks,
				grades: { type: gradeType, value: gradeValue },
				userId,
			} = data;

			const query = educationQueries._createEducationQuery();
			const values = [
				courseName,
				institute,
				startDate,
				endDate || null,
				isOngoing || false,
				degree || null,
				skills || [],
				courseworks || [],
				gradeType,
				gradeValue,
				userId,
			];

			const result = await client.query(query, values);
			await client.query("COMMIT");

			return EducationService.mapRowToEducation(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async getEducationsByUser(userId) {
		const client = await pool.connect();
		try {
			const query = educationQueries._getEducationsByUserQuery();
			const result = await client.query(query, [userId]);

			return result.rows.map(EducationService.mapRowToEducation);
		} finally {
			client.release();
		}
	}

	static async updateEducation(_id, userId, updates) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const checkQuery = educationQueries._getEducationByIdQuery();
			const checkResult = await client.query(checkQuery, [_id, userId]);

			if (checkResult.rows.length === 0) {
				throw new Error("Education not found or unauthorized");
			}

			const {
				courseName,
				institute,
				periodOfCourse,
				degree,
				skills,
				courseworks,
				grades,
			} = updates;

			const query = educationQueries._updateEducationQuery();
			const values = [
				courseName,
				institute,
				periodOfCourse?.startDate,
				periodOfCourse?.endDate,
				periodOfCourse?.isOngoing,
				degree,
				skills,
				courseworks,
				grades?.type,
				grades?.value,
				_id,
				userId,
			];

			const result = await client.query(query, values);

			if (result.rows.length === 0) {
				throw new Error("Failed to update education");
			}

			await client.query("COMMIT");

			return EducationService.mapRowToEducation(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deleteEducation(educationId, userId) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const query = educationQueries._deleteEducationQuery();
			const result = await client.query(query, [educationId, userId]);

			if (result.rows.length === 0) {
				throw new Error("Education not found or unauthorized");
			}

			await client.query("COMMIT");
			return EducationService.mapRowToEducation(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}
}

module.exports = EducationService;