const _createSocialProfile = () => `
    INSERT INTO social_profiles (
        user_id, is_public, email, phone,
        linkedin_url, linkedin_username,
        twitter_url, twitter_username,
        github_url, github_username,
        website_url, website_username,
        youtube_url, youtube_username,
        instagram_url, instagram_username,
        facebook_url, facebook_username,
        medium_url, medium_username,
        devto_url, devto_username,
        other_platform, other_url, other_username
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25
    )
    RETURNING *
`;

const _updateSocialProfile = () => `
    UPDATE social_profiles 
    SET is_public = COALESCE($2, is_public),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        linkedin_url = COALESCE($5, linkedin_url),
        linkedin_username = COALESCE($6, linkedin_username),
        twitter_url = COALESCE($7, twitter_url),
        twitter_username = COALESCE($8, twitter_username),
        github_url = COALESCE($9, github_url),
        github_username = COALESCE($10, github_username),
        website_url = COALESCE($11, website_url),
        website_username = COALESCE($12, website_username),
        youtube_url = COALESCE($13, youtube_url),
        youtube_username = COALESCE($14, youtube_username),
        instagram_url = COALESCE($15, instagram_url),
        instagram_username = COALESCE($16, instagram_username),
        facebook_url = COALESCE($17, facebook_url),
        facebook_username = COALESCE($18, facebook_username),
        medium_url = COALESCE($19, medium_url),
        medium_username = COALESCE($20, medium_username),
        devto_url = COALESCE($21, devto_url),
        devto_username = COALESCE($22, devto_username),
        other_platform = COALESCE($23, other_platform),
        other_url = COALESCE($24, other_url),
        other_username = COALESCE($25, other_username),
        updated_at = CURRENT_TIMESTAMP
    WHERE _id = $1
    RETURNING *
`;

const _getSocialProfilesByUserId = () => `
    SELECT * FROM social_profiles 
    WHERE user_id = $1 
    ORDER BY created_at DESC
`;

const _getSocialProfileById = () => `
    SELECT * FROM social_profiles 
    WHERE _id = $1
`;

const _deleteSocialProfile = () => `
    DELETE FROM social_profiles 
    WHERE _id = $1
    RETURNING *
`;

const _checkProfileOwnership = () => `
    SELECT _id FROM social_profiles 
    WHERE _id = $1 AND user_id = $2
`;

const _getAllPublicProfiles = () => `
    SELECT * FROM social_profiles 
    WHERE is_public = true
    ORDER BY created_at DESC
`;

module.exports = {
	_createSocialProfile,
	_updateSocialProfile,
	_getSocialProfilesByUserId,
	_getSocialProfileById,
	_deleteSocialProfile,
	_checkProfileOwnership,
	_getAllPublicProfiles,
};
