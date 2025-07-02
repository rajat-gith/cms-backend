const _findByEmail = () => `
  SELECT * FROM auth WHERE email = $1
`;

const _findByGoogleId = () => `
  SELECT * FROM auth WHERE google_id = $1
`;

const _createAuth = () => `
  INSERT INTO auth (user_id, email, password, google_id, profile_picture)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
`;

const _updateAuth = (fields) => {
	const setClause = Object.keys(fields)
		.map((key, i) => `${key} = $${i + 2}`)
		.join(", ");

	return {
		query: `UPDATE auth SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
		values: Object.values(fields),
	};
};

module.exports = {
	_findByEmail,
	_findByGoogleId,
	_createAuth,
	_updateAuth,
};
