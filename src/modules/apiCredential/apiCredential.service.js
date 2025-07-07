const db = require("../../db/index");
const queries = require("./apiCredential.queries");

class ApiCredentialService {
	static async getCredentialsByUser(userId) {
		const { rows } = await db.query(queries._getCredentialsByUser(), [
			userId,
		]);
		return rows;
	}

	static async getCredentialByApiKey(apiKey) {
		const { rows } = await db.query(queries._getCredentialByApiKey(), [
			apiKey,
		]);
		return rows[0] || null;
	}

	static async createCredential(userId, apiKey, apiSecretHash) {
		const client = await db.connect();
		try {
			await client.query("BEGIN");

			const { rows } = await client.query(queries._createCredential(), [
				userId,
				apiKey,
				apiSecretHash,
			]);

			await client.query("COMMIT");
			return rows[0];
		} catch (error) {
			await client.query("ROLLBACK");
			throw new Error(`Error creating API credential: ${error.message}`);
		} finally {
			client.release();
		}
	}

	static async deleteCredential(id, userId) {
		const client = await db.connect();
		try {
			await client.query("BEGIN");

			const { rows } = await client.query(queries._deleteCredential(), [
				id,
				userId,
			]);

			await client.query("COMMIT");
			return rows[0] || null;
		} catch (error) {
			await client.query("ROLLBACK");
			throw new Error(`Error deleting API credential: ${error.message}`);
		} finally {
			client.release();
		}
	}

	static async toggleCredential(id, userId) {
		const client = await db.connect();
		try {
			await client.query("BEGIN");

			const { rows } = await client.query(queries._toggleCredential(), [
				id,
				userId,
			]);

			await client.query("COMMIT");
			return rows[0] || null;
		} catch (error) {
			await client.query("ROLLBACK");
			throw new Error(`Error toggling API credential: ${error.message}`);
		} finally {
			client.release();
		}
	}

	static async countActiveByUser(userId) {
		const { rows } = await db.query(queries._countActiveByUser(), [userId]);
		return parseInt(rows[0]?.count || "0", 10);
	}

	static async updateLastUsed(id) {
		const client = await db.connect();
		try {
			await client.query("BEGIN");
			await client.query(queries._updateLastUsed(), [id]);
			await client.query("COMMIT");
		} catch (error) {
			await client.query("ROLLBACK");
			throw new Error(
				`Error updating last used timestamp: ${error.message}`
			);
		} finally {
			client.release();
		}
	}
}

module.exports = ApiCredentialService;
