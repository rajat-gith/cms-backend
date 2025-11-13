const { Pool } = require("pg");
const config = require("../config");

const pool = new Pool(config.db);

pool.query("SELECT NOW()", (err, res) => {
	if (err) {
		console.error("Database connection failed:", err.stack);
	} else {
		console.log("Connected to DB at:", res.rows[0].now);
	}
});

module.exports = pool;
