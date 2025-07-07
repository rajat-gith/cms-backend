const _addCertification = () => {
	return `
        INSERT INTO certifications (
            name, 
            issuing_organization, 
            issue_date, 
            expiration_date, 
            is_expired, 
            credential_id, 
            credential_url, 
            category, 
            skills, 
            user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;
};

const _getCertificationsByUser = () => {
	return `
        SELECT * FROM certifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
};

const _updateCertification = () => {
	return `
        UPDATE certifications 
        SET 
            name = COALESCE($2, name),
            issuing_organization = COALESCE($3, issuing_organization),
            issue_date = COALESCE($4, issue_date),
            expiration_date = COALESCE($5, expiration_date),
            is_expired = COALESCE($6, is_expired),
            credential_id = COALESCE($7, credential_id),
            credential_url = COALESCE($8, credential_url),
            category = COALESCE($9, category),
            skills = COALESCE($10, skills),
            updated_at = CURRENT_TIMESTAMP
        WHERE _id = $1
        RETURNING *
    `;
};

const _deleteCertification = () => {
	return `
        DELETE FROM certifications 
        WHERE _id = $1
        RETURNING *
    `;
};

const _getCertificationById = () => {
	return `
        SELECT * FROM certifications 
        WHERE _id = $1
    `;
};

const _getCertificationByIdAndUser = () => {
	return `
        SELECT * FROM certifications 
        WHERE _id = $1 AND user_id = $2
    `;
};

const _getExpiredCertifications = () => {
	return `
        SELECT * FROM certifications 
        WHERE user_id = $1 AND (is_expired = true OR expiration_date < CURRENT_DATE)
        ORDER BY expiration_date DESC
    `;
};

const _getActiveCertifications = () => {
	return `
        SELECT * FROM certifications 
        WHERE user_id = $1 AND is_expired = false AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
        ORDER BY created_at DESC
    `;
};

const _getCertificationsByCategory = () => {
	return `
        SELECT * FROM certifications 
        WHERE user_id = $1 AND category = $2
        ORDER BY created_at DESC
    `;
};

const _searchCertifications = () => {
	return `
        SELECT * FROM certifications 
        WHERE user_id = $1 AND (
            name ILIKE '%' || $2 || '%' OR 
            issuing_organization ILIKE '%' || $2 || '%' OR 
            category ILIKE '%' || $2 || '%'
        )
        ORDER BY created_at DESC
    `;
};

module.exports = {
	_addCertification,
	_getCertificationsByUser,
	_updateCertification,
	_deleteCertification,
	_getCertificationById,
	_getCertificationByIdAndUser,
	_getExpiredCertifications,
	_getActiveCertifications,
	_getCertificationsByCategory,
	_searchCertifications,
};
