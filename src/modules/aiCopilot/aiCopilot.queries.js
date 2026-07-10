const _getStatusByUser = () => `
    SELECT * FROM ai_ingestion_status WHERE user_id = $1
`;

// Upsert: create the row on first sync, otherwise update it.
const _upsertSuccess = () => `
    INSERT INTO ai_ingestion_status (user_id, last_ingested_at, last_ingest_stats, last_error, updated_at)
    VALUES ($1, CURRENT_TIMESTAMP, $2, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id)
    DO UPDATE SET
        last_ingested_at = CURRENT_TIMESTAMP,
        last_ingest_stats = EXCLUDED.last_ingest_stats,
        last_error = NULL,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
`;

const _upsertFailure = () => `
    INSERT INTO ai_ingestion_status (user_id, last_error, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id)
    DO UPDATE SET
        last_error = EXCLUDED.last_error,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
`;

module.exports = {
	_getStatusByUser,
	_upsertSuccess,
	_upsertFailure,
};