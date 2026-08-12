const _addSkillQuery = () => {
    return `
        INSERT INTO skills (name, level, category, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING 
            _id, 
            name, 
            level, 
            category, 
            user_id AS "userId", 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
    `;
};

const _getSkillsByUserQuery = () => {
    return `
        SELECT 
            _id, 
            name, 
            level, 
            category, 
            user_id AS "userId", 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
        FROM 
            skills
        WHERE 
            user_id = $1
        ORDER BY 
            created_at DESC
    `;
};

const _updateSkillQuery = () => {
    return `
        UPDATE skills
        SET name = COALESCE($2, name),
            level = COALESCE($3, level),
            category = COALESCE($4, category),
            updated_at = CURRENT_TIMESTAMP
        WHERE _id = $1 AND user_id = $5
        RETURNING 
            _id, 
            name, 
            level, 
            category, 
            user_id AS "userId", 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
    `;
};

const _deleteSkillQuery = () => {
    return `
        DELETE FROM skills
        WHERE _id = $1 AND user_id = $2
        RETURNING _id
    `;
};

const _getSkillByIdQuery = () => {
    return `
        SELECT 
            _id, 
            name, 
            level, 
            category, 
            user_id AS "userId", 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
        FROM skills
        WHERE _id = $1
    `;
};

const _getSkillByIdAndUserQuery = () => {
    return `
        SELECT 
            _id, 
            name, 
            level, 
            category, 
            user_id AS "userId", 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
        FROM skills
        WHERE _id = $1 AND user_id = $2
    `;
};

const _validateUserExistsQuery = () => {
    return `
        SELECT _id FROM users WHERE _id = $1
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