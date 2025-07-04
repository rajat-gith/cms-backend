const educationQueries = require("./education.queries");
const pool = require("../../db/index");

class EducationService {
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

			return result.rows[0];
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

			return result.rows.map((row) => ({
				id: row.id,
				courseName: row.course_name,
				institute: row.institute,
				periodOfCourse: {
					startDate: row.start_date,
					endDate: row.end_date,
					isOngoing: row.is_ongoing,
				},
				degree: row.degree,
				skills: row.skills,
				courseworks: row.courseworks,
				grades: {
					type: row.grade_type,
					value: row.grade_value,
				},
				userId: row.user_id,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}));
		} finally {
			client.release();
		}
	}

	static async updateEducation(id, userId, updates) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const checkQuery = educationQueries._getEducationByIdQuery();
			const checkResult = await client.query(checkQuery, [id, userId]);

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
				id,
				userId,
			];

			const result = await client.query(query, values);

			if (result.rows.length === 0) {
				throw new Error("Failed to update education");
			}

			await client.query("COMMIT");

			const row = result.rows[0];
			return {
				id: row.id,
				courseName: row.course_name,
				institute: row.institute,
				periodOfCourse: {
					startDate: row.start_date,
					endDate: row.end_date,
					isOngoing: row.is_ongoing,
				},
				degree: row.degree,
				skills: row.skills,
				courseworks: row.courseworks,
				grades: {
					type: row.grade_type,
					value: row.grade_value,
				},
				userId: row.user_id,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			};
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deleteEducation(educationId) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const query = educationQueries._deleteEducationQuery();
			const result = await client.query(query, [educationId]);

			if (result.rows.length === 0) {
				throw new Error("Education not found");
			}

			await client.query("COMMIT");
			return result.rows[0];
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}
}

module.exports = EducationService;
