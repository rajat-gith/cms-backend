const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DB,
	password: process.env.PG_PASS,
	port: 5432,
});

pool.query("SELECT NOW()", (err, res) => {
	if (err) {
		console.error("❌ Database connection failed:", err.stack);
	} else {
		console.log("✅ Database connected successfully at:", res.rows[0].now);
	}
});

module.exports = pool;
