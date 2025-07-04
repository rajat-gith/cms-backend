const _addExperienceQuery = () => {
	return `
        INSERT INTO experience (
            user_id, title, company, location, employment_type, 
            start_date, end_date, ongoing, description, technologies_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;
};

const _getExperiencesByUserQuery = () => {
	return `
        SELECT * FROM experience 
        WHERE user_id = $1 
        ORDER BY start_date DESC
    `;
};

const _updateExperienceQuery = () => {
	return `
        UPDATE experience 
        SET title = COALESCE($1, title),
            company = COALESCE($2, company),
            location = COALESCE($3, location),
            employment_type = COALESCE($4, employment_type),
            start_date = COALESCE($5, start_date),
            end_date = COALESCE($6, end_date),
            ongoing = COALESCE($7, ongoing),
            description = COALESCE($8, description),
            technologies_used = COALESCE($9, technologies_used),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
    `;
};

const _deleteExperienceQuery = () => {
	return `
        DELETE FROM experience 
        WHERE id = $1
        RETURNING *
    `;
};

const _getExperienceByIdQuery = () => {
	return `
        SELECT * FROM experience 
        WHERE id = $1
    `;
};

module.exports = {
	_addExperienceQuery,
	_getExperiencesByUserQuery,
	_updateExperienceQuery,
	_deleteExperienceQuery,
	_getExperienceByIdQuery,
};
