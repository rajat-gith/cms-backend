const _addSkillQuery = () => {
	return `
        INSERT INTO skills (name, level, category, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, level, category, user_id, created_at, updated_at
    `;
};

const _getSkillsByUserQuery = () => {
	return `
        SELECT id, name, level, category, user_id, created_at, updated_at
        FROM skills
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
};

const _updateSkillQuery = () => {
	return `
        UPDATE skills
        SET name = COALESCE($2, name),
            level = COALESCE($3, level),
            category = COALESCE($4, category),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $5
        RETURNING id, name, level, category, user_id, created_at, updated_at
    `;
};

const _deleteSkillQuery = () => {
	return `
        DELETE FROM skills
        WHERE id = $1 AND user_id = $2
        RETURNING id
    `;
};

const _getSkillByIdQuery = () => {
	return `
        SELECT id, name, level, category, user_id, created_at, updated_at
        FROM skills
        WHERE id = $1
    `;
};

const _getSkillByIdAndUserQuery = () => {
	return `
        SELECT id, name, level, category, user_id, created_at, updated_at
        FROM skills
        WHERE id = $1 AND user_id = $2
    `;
};

const _validateUserExistsQuery = () => {
	return `
        SELECT id FROM users WHERE id = $1
    `;
};

module.exports = {
	_addSkillQuery,
	_getSkillsByUserQuery,
	_updateSkillQuery,
	_deleteSkillQuery,
    _getSkillByIdQuery,
    _getSkillByIdAndUserQuery,
    _validateUserExistsQuery,
};