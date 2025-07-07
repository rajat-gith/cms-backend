// Award & Honor Queries
const _createAwardHonor = () => `
    INSERT INTO award_honors (user_id, title, issuer, date_received, description, certificate_link, category, location)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
`;

// Interest Queries
const _createInterest = () => `
    INSERT INTO interests (user_id, title, description, category, icon)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
`;

// Language Queries
const _createLanguage = () => `
    INSERT INTO languages (user_id, name, proficiency, certification)
    VALUES ($1, $2, $3, $4)
    RETURNING *
`;

// Volunteering Queries
const _createVolunteering = () => `
    INSERT INTO volunteering (
        user_id, role, organization, cause, 
        start_date, end_date, is_ongoing, 
        description, location, website
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
`;

// Extracurricular Queries
const _createExtracurricular = () => `
    INSERT INTO extracurricular (
        user_id, title, organization, position, 
        start_date, end_date, is_ongoing, 
        description, location
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
`;

// Generic by-table operations are split and not fully safe for direct SQL string usage
// Use programmatic helpers to avoid SQL injection
const _getAllFromTableByUser = (table) => `
    SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC
`;

const _getByIdAndUserFromTable = (table) => `
    SELECT * FROM ${table} WHERE _id = $1 AND user_id = $2
`;

const _deleteByIdAndUserFromTable = (table) => `
    DELETE FROM ${table} WHERE _id = $1 AND user_id = $2 RETURNING *
`;

const _updateByIdAndUserFromTable = (table, columns) => {
	const setClause = columns
		.map((col, idx) => `${col} = COALESCE($${idx + 3}, ${col})`)
		.join(", ");
	return `
        UPDATE ${table}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE _id = $1 AND user_id = $2
        RETURNING *
    `;
};

module.exports = {
	_createAwardHonor,
	_createInterest,
	_createLanguage,
	_createVolunteering,
	_createExtracurricular,

	_getAllFromTableByUser,
	_getByIdAndUserFromTable,
	_deleteByIdAndUserFromTable,
	_updateByIdAndUserFromTable,
};
