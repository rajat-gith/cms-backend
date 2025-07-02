const db = require("../../config/index");
const queries = require("./apiCredential.queries");

const getCredentialsByUser = async (userId) => {
	const { rows } = await db.query(queries._getCredentialsByUser(), [userId]);
	return rows;
};

const getCredentialByApiKey = async (apiKey) => {
	const { rows } = await db.query(queries._getCredentialByApiKey(), [apiKey]);
	return rows[0];
};

const createCredential = async (userId, apiKey, apiSecretHash) => {
	const { rows } = await db.query(queries._createCredential(), [
		userId,
		apiKey,
		apiSecretHash,
	]);
	return rows[0];
};

const deleteCredential = async (id, userId) => {
	const { rows } = await db.query(queries._deleteCredential(), [id, userId]);
	return rows[0];
};

const toggleCredential = async (id, userId) => {
	const { rows } = await db.query(queries._toggleCredential(), [id, userId]);
	return rows[0];
};

const countActiveByUser = async (userId) => {
	const { rows } = await db.query(queries._countActiveByUser(), [userId]);
	return parseInt(rows[0].count, 10);
};

const updateLastUsed = async (id) => {
	await db.query(queries._updateLastUsed(), [id]);
};

module.exports = {
	getCredentialsByUser,
	getCredentialByApiKey,
	createCredential,
	deleteCredential,
	toggleCredential,
	countActiveByUser,
	updateLastUsed,
};
