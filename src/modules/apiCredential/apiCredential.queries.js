const _getCredentialsByUser = () => `
    SELECT id, api_key, user_id, is_active, created_at, updated_at
    FROM api_credentials
    WHERE user_id = ?
`;

const _getCredentialByApiKey = () => `
    SELECT * FROM api_credentials
    WHERE api_key = ? AND is_active = true
`;

const _createCredential = () => `
    INSERT INTO api_credentials (user_id, api_key, api_secret_hash)
    VALUES (?, ?, ?)
    RETURNING *
`;

const _deleteCredential = () => `
    DELETE FROM api_credentials
    WHERE id = ? AND user_id = ?
    RETURNING id
`;

const _toggleCredential = () => `
    UPDATE api_credentials
    SET is_active = NOT is_active, updated_at = NOW()
    WHERE id = ? AND user_id = ?
    RETURNING *
`;

const _countActiveByUser = () => `
    SELECT COUNT(*) FROM api_credentials
    WHERE user_id = ? AND is_active = true
`;

const _updateLastUsed = () => `
    UPDATE api_credentials
    SET last_used_at = NOW()
    WHERE id = ?
`;

module.exports = {
	_getCredentialsByUser,
	_getCredentialByApiKey,
	_createCredential,
	_deleteCredential,
	_toggleCredential,
	_countActiveByUser,
	_updateLastUsed,
};
