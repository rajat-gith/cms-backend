const pool = require("../../db/index");
const skillQueries = require("./skill.queries");

class SkillService {
	static mapDbRowToSkill(row) {
		if (!row) return null;
		return {
			_id: row._id,
			name: row.name,
			level: row.level,
			category: row.category,
			userId: row.userId,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	static async addSkill(data) {
		const { name, level, category, userId } = data;
		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			const userCheck = await client.query(
				skillQueries._validateUserExistsQuery(),
				[userId]
			);

			if (userCheck.rows.length === 0) {
				throw new Error("User not found");
			}

			const result = await client.query(skillQueries._addSkillQuery(), [
				name,
				level,
				category,
				userId,
			]);

			await client.query("COMMIT");
			return SkillService.mapDbRowToSkill(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async getSkillsByUser(userId) {
		const client = await pool.connect();

		try {
			const result = await client.query(
				skillQueries._getSkillsByUserQuery(),
				[userId]
			);
			return result.rows.map(SkillService.mapDbRowToSkill);
		} finally {
			client.release();
		}
	}

	static async updateSkill(skillId, updates, userId) {
		const { name, level, category } = updates;
		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			const result = await client.query(
				skillQueries._updateSkillQuery(),
				[skillId, name, level, category, userId]
			);

			if (result.rows.length === 0) {
				throw new Error("Skill not found or access denied");
			}

			await client.query("COMMIT");
			return SkillService.mapDbRowToSkill(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deleteSkill(skillId, userId) {
		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			const result = await client.query(
				skillQueries._deleteSkillQuery(),
				[skillId, userId]
			);

			if (result.rows.length === 0) {
				throw new Error("Skill not found or access denied");
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

	static async getSkillById(skillId) {
		const client = await pool.connect();

		try {
			const result = await client.query(
				skillQueries._getSkillByIdQuery(),
				[skillId]
			);
			return SkillService.mapDbRowToSkill(result.rows[0]);
		} finally {
			client.release();
		}
	}

	static async getSkillByIdAndUser(skillId, userId) {
		const client = await pool.connect();

		try {
			const result = await client.query(
				skillQueries._getSkillByIdAndUserQuery(),
				[skillId, userId]
			);
			return SkillService.mapDbRowToSkill(result.rows[0]);
		} finally {
			client.release();
		}
	}
}

module.exports = SkillService;