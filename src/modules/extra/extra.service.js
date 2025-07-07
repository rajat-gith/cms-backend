const { pool } = require("../../db/index");
const extraQueries = require("./extra.queries");

const tableMap = {
	"award-honor": "award_honors",
	interest: "interests",
	language: "languages",
	volunteering: "volunteering",
	extracurricular: "extracurricular",
};

const entityMap = {
	"award-honors": { table: "award_honors", singular: "AwardHonor" },
	interests: { table: "interests", singular: "Interest" },
	languages: { table: "languages", singular: "Language" },
	volunteering: { table: "volunteering", singular: "Volunteering" },
	extracurricular: { table: "extracurricular", singular: "Extracurricular" },
};

const getTable = (type) => {
	const table = tableMap[type];
	if (!table) throw new Error(`❌ Invalid schema type: ${type}`);
	return table;
};

const buildSetClause = (data) => {
	const keys = Object.keys(data);
	const setClause = keys.map((key, i) => `${key} = $${i + 3}`).join(", ");
	return { setClause, values: Object.values(data) };
};

const getCreateParams = (type, userId, data) => {
	switch (type) {
		case "award-honor":
			return [
				userId,
				data.title,
				data.issuer || null,
				data.dateReceived || null,
				data.description || null,
				data.certificateLink || null,
				data.category || null,
				data.location || null,
			];
		case "interest":
			return [
				userId,
				data.title,
				data.description || null,
				data.category || null,
				data.icon || null,
			];
		case "language":
			return [
				userId,
				data.name,
				data.proficiency || "Basic",
				data.certification || null,
			];
		case "volunteering":
			return [
				userId,
				data.role,
				data.organization,
				data.cause || null,
				data.period?.startDate || null,
				data.period?.endDate || null,
				data.period?.isOngoing || false,
				data.description || null,
				data.location || null,
				data.website || null,
			];
		case "extracurricular":
			return [
				userId,
				data.title,
				data.organization || null,
				data.position || null,
				data.period?.startDate || null,
				data.period?.endDate || null,
				data.period?.isOngoing || false,
				data.description || null,
				data.location || null,
			];
		default:
			throw new Error(`❌ Invalid type: ${type}`);
	}
};

const getCreateQuery = (type) => {
	switch (type) {
		case "award-honor":
			return extraQueries._createAwardHonor();
		case "interest":
			return extraQueries._createInterest();
		case "language":
			return extraQueries._createLanguage();
		case "volunteering":
			return extraQueries._createVolunteering();
		case "extracurricular":
			return extraQueries._createExtracurricular();
		default:
			throw new Error(`❌ Invalid type: ${type}`);
	}
};

const toCamelCase = (obj) => {
	if (!obj || typeof obj !== "object") return obj;
	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
			letter.toUpperCase()
		);
		result[camelKey] = value;
	}
	return result;
};

const toSnakeCase = (obj) => {
	if (!obj || typeof obj !== "object") return obj;
	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = key.replace(
			/[A-Z]/g,
			(letter) => `_${letter.toLowerCase()}`
		);
		result[snakeKey] = value;
	}
	return result;
};

const ExtraService = {
	async create(type, userId, data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			const query = getCreateQuery(type);
			const params = getCreateParams(type, userId, data);
			const result = await client.query(query, params);
			await client.query("COMMIT");
			return toCamelCase(result.rows[0]);
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		} finally {
			client.release();
		}
	},

	async getAll(type, userId) {
		const client = await pool.connect();
		try {
			const table = getTable(type);
			const query = extraQueries
				._getAllByUserAndTable()
				.replace("{table}", table);
			const result = await client.query(query, [userId]);
			return result.rows.map(toCamelCase);
		} finally {
			client.release();
		}
	},

	async update(type, id, userId, data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			const table = getTable(type);
			const snakeData = toSnakeCase(data);

			delete snakeData.id;
			delete snakeData.user_id;
			delete snakeData.created_at;
			delete snakeData.updated_at;

			if (Object.keys(snakeData).length === 0) {
				throw new Error("No valid fields to update");
			}

			const { setClause, values } = buildSetClause(snakeData);
			const query = extraQueries
				._updateByIdAndUser()
				.replace("{table}", table)
				.replace("{setClause}", setClause);

			const result = await client.query(query, [id, userId, ...values]);
			if (result.rows.length === 0) {
				throw new Error("Record not found or not authorized");
			}

			await client.query("COMMIT");
			return toCamelCase(result.rows[0]);
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		} finally {
			client.release();
		}
	},

	async remove(type, id, userId) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			const table = getTable(type);
			const query = extraQueries
				._deleteByIdAndUser()
				.replace("{table}", table);
			const result = await client.query(query, [id, userId]);
			if (result.rows.length === 0) {
				throw new Error("Record not found or not authorized");
			}
			await client.query("COMMIT");
			return toCamelCase(result.rows[0]);
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		} finally {
			client.release();
		}
	},
};

// Dynamic getter for each entity type: getAwardHonorsByUser, getLanguagesByUser, etc.
for (const [type, { table, singular }] of Object.entries(entityMap)) {
	const functionName = `get${singular}sByUser`;
	ExtraService[functionName] = async (userId) => {
		const client = await pool.connect();
		try {
			const query = extraQueries
				._getByUserAndTable()
				.replace("{table}", table);
			const result = await client.query(query, [userId]);
			return result.rows.map(toCamelCase);
		} finally {
			client.release();
		}
	};
}

module.exports = ExtraService;
