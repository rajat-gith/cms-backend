const _createEducationQuery = () => {
	return `
    INSERT INTO education (
        course_name,
        institute,
        start_date,
        end_date,
        is_ongoing,
        degree,
        skills,
        courseworks,
        grade_type,
        grade_value,
        user_id
    ) VALUES (
        $1,                     -- course_name
        $2,                     -- institute
        TO_DATE($3 || '-01', 'YYYY-MM-DD'),   -- start_date
        CASE 
        WHEN $4 = '' OR $5::boolean = true THEN NULL
        ELSE TO_DATE($4 || '-01', 'YYYY-MM-DD')
        END,                    -- end_date
        $5,                     -- is_ongoing
        $6,                     -- degree
        $7,                     -- skills (array)
        $8,                     -- courseworks (array)
        $9,                     -- grade_type
        $10,                    -- grade_value
        $11                     -- user_id
    )
    RETURNING *;`;
};

const _getEducationsByUserQuery = () => {
	return `
        SELECT * FROM education 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
};

const _updateEducationQuery = () => {
	return `
        UPDATE education 
        SET course_name = COALESCE($1, course_name),
            institute = COALESCE($2, institute),
            start_date = COALESCE($3, start_date),
            end_date = COALESCE($4, end_date),
            is_ongoing = COALESCE($5, is_ongoing),
            degree = COALESCE($6, degree),
            skills = COALESCE($7, skills),
            courseworks = COALESCE($8, courseworks),
            grade_type = COALESCE($9, grade_type),
            grade_value = COALESCE($10, grade_value),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11 AND user_id = $12
        RETURNING *
    `;
};

const _deleteEducationQuery = () => {
	return `
        DELETE FROM education 
        WHERE id = $1
        RETURNING *
    `;
};

const _getEducationByIdQuery = () => {
	return `
        SELECT * FROM education 
        WHERE id = $1 AND user_id = $2
    `;
};

module.exports = {
	_createEducationQuery,
	_getEducationsByUserQuery,
	_updateEducationQuery,
	_deleteEducationQuery,
	_getEducationByIdQuery,
};
