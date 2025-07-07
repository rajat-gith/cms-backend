const _findUserById = () => `
  SELECT 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
  FROM users 
  WHERE _id = $1
`;

const _findUserByEmail = () => `
  SELECT *
  FROM users
  WHERE email = $1
`;

const _findUserByGoogleId = () => `
  SELECT 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
  FROM users 
  WHERE google_id = $1
`;

const _createUser = () => `
  INSERT INTO users (
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
  )
  RETURNING 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
`;

const _updateUser = () => `
  UPDATE users SET
    first_name = COALESCE($1, first_name),
    middle_name = COALESCE($2, middle_name),
    last_name = COALESCE($3, last_name),
    username = COALESCE($4, username),
    linkedin_url = COALESCE($5, linkedin_url),
    github_url = COALESCE($6, github_url),
    other_links = COALESCE($7::jsonb, other_links),
    about = COALESCE($8, about),
    profile_photo = COALESCE($9, profile_photo),
    location = COALESCE($10::jsonb, location),
    phone = COALESCE($11, phone),
    google_id = CASE WHEN $12::text IS NULL THEN NULL ELSE COALESCE($13::text, google_id) END,
    updated_at = CURRENT_TIMESTAMP
  WHERE _id = $14
  RETURNING 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
`;

const _checkUserPassword = () => `
  SELECT 
    _id,
    CASE WHEN password IS NOT NULL AND password != '' THEN true ELSE false END AS has_password
  FROM users 
  WHERE _id = $1
`;

const _updateGoogleAccount = () => `
  UPDATE users SET
    google_id = $1,
    profile_photo = COALESCE($2, profile_photo),
    updated_at = CURRENT_TIMESTAMP
  WHERE _id = $3
  RETURNING 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
`;

const _unlinkGoogleAccount = () => `
  UPDATE users SET
    google_id = NULL,
    profile_photo = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE _id = $1
  RETURNING 
    _id,
    first_name,
    middle_name,
    last_name,
    username,
    linkedin_url,
    github_url,
    other_links,
    is_profile_complete,
    about,
    profile_photo,
    email,
    google_id,
    location,
    phone,
    role
`;

module.exports = {
	_findUserById,
	_findUserByEmail,
	_findUserByGoogleId,
	_createUser,
	_updateUser,
	_checkUserPassword,
	_updateGoogleAccount,
	_unlinkGoogleAccount,
};
