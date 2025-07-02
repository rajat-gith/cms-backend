const _createFullBlog = () => `
  INSERT INTO blogs (title, content, tags, author_name, author_user_id, cover_image, is_published, published_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
`;

const _checkDuplicateTitle = () => `
  SELECT 1 FROM blogs WHERE title = $1 AND author_user_id = $2
`;

const _validateUserExists = () => `
  SELECT 1 FROM users WHERE id = $1
`;

const _getAllBlogsByUserId = () => `
  SELECT * FROM blogs WHERE author_user_id = $1 ORDER BY created_at DESC
`;

const _getBlogById = () => `
  SELECT * FROM blogs WHERE id = $1
`;

const _updateBlogById = () => `
  UPDATE blogs SET
    title = $1,
    content = $2,
    tags = $3,
    cover_image = $4,
    is_published = $5,
    published_at = $6,
    updated_at = NOW()
  WHERE id = $7
  RETURNING *
`;

const _deleteBlogById = () => `
  DELETE FROM blogs WHERE id = $1 RETURNING id
`;

const _getUserNameById = () => `
  SELECT username FROM users WHERE id = $1
`;

const _getBlogWithAuthor = () => `
  SELECT * FROM blogs WHERE id = $1
`;

const _searchBlogs = () => `
  SELECT * FROM blogs
  WHERE (title ILIKE $1 OR content ILIKE $2) AND author_user_id = $3
`;

const _countBlogsByUserId = () => `
  SELECT COUNT(*) AS total FROM blogs WHERE author_user_id = $1
`;

module.exports = {
	_createFullBlog,
	_checkDuplicateTitle,
	_validateUserExists,
	_getAllBlogsByUserId,
	_getBlogById,
	_updateBlogById,
	_deleteBlogById,
	_getUserNameById,
	_getBlogWithAuthor,
	_searchBlogs,
	_countBlogsByUserId,
};
