const _getCredentialsByUser = () => `
  SELECT id, api_key, user_id, is_active, created_at, updated_at
  FROM api_credentials
  WHERE user_id = $1
`;

const _getCredentialByApiKey = () => `
  SELECT * FROM api_credentials
  WHERE api_key = $1 AND is_active = true
`;

const _createCredential = () => `
  INSERT INTO api_credentials (user_id, api_key, api_secret_hash)
  VALUES ($1, $2, $3)
  RETURNING *
`;

const _deleteCredential = () => `
  DELETE FROM api_credentials
  WHERE id = $1 AND user_id = $2
  RETURNING id
`;

const _toggleCredential = () => `
  UPDATE api_credentials
  SET is_active = NOT is_active, updated_at = NOW()
  WHERE id = $1 AND user_id = $2
  RETURNING *
`;

const _countActiveByUser = () => `
  SELECT COUNT(*) FROM api_credentials
  WHERE user_id = $1 AND is_active = true
`;

const _updateLastUsed = () => `
  UPDATE api_credentials
  SET last_used_at = NOW()
  WHERE id = $1
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
