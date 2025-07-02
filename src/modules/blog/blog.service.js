const db = require("../../config/index");
const queries = require("./blog.queries");

class BlogService {
	static mapDbRowToBlog(row) {
		if (!row) return null;
		return {
			id: row.id,
			title: row.title,
			content: row.content,
			tags: row.tags || [],
			author: {
				name: row.author_name,
				userId: row.author_user_id,
			},
			coverImage: row.cover_image,
			isPublished: row.is_published,
			publishedAt: row.published_at,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async createBlog(data) {
		const client = await db.connect();
		try {
			const userCheck = await client.query(
				queries._validateUserExists(),
				[data.author.userId]
			);
			if (userCheck.rowCount === 0) throw new Error("User not found");

			const dupCheck = await client.query(
				queries._checkDuplicateTitle(),
				[data.title, data.author.userId]
			);
			if (dupCheck.rowCount > 0)
				throw new Error("Blog with this title already exists");

			const result = await client.query(queries._createFullBlog(), [
				data.title,
				data.content,
				data.tags,
				data.author.name,
				data.author.userId,
				data.coverImage,
				data.isPublished,
				data.publishedAt,
			]);
			return this.mapDbRowToBlog(result.rows[0]);
		} finally {
			client.release();
		}
	}

	static async getAllBlogs(userId) {
		const { rows } = await db.query(queries._getAllBlogsByUserId(), [
			userId,
		]);
		return rows.map(this.mapDbRowToBlog);
	}

	static async getBlogById(blogId) {
		const { rows } = await db.query(queries._getBlogById(), [blogId]);
		return this.mapDbRowToBlog(rows[0]);
	}

	static async updateBlog(blogId, updates) {
		const { rows } = await db.query(queries._updateBlogById(), [
			updates.title,
			updates.content,
			updates.tags,
			updates.coverImage,
			updates.isPublished,
			updates.publishedAt,
			blogId,
		]);
		return this.mapDbRowToBlog(rows[0]);
	}

	static async deleteBlog(blogId) {
		const { rows } = await db.query(queries._deleteBlogById(), [blogId]);
		return rows[0] ? { deleted: true, id: rows[0].id } : null;
	}

	static async getUserName(userId) {
		const { rows } = await db.query(queries._getUserNameById(), [userId]);
		return rows[0]?.username || null;
	}

	static async searchBlogs(term, userId) {
		const pattern = `%${term}%`;
		const { rows } = await db.query(queries._searchBlogs(), [
			pattern,
			pattern,
			userId,
		]);
		return rows.map(this.mapDbRowToBlog);
	}

	static async countUserBlogs(userId) {
		const { rows } = await db.query(queries._countBlogsByUserId(), [
			userId,
		]);
		return parseInt(rows[0]?.total || 0);
	}
}

module.exports = BlogService;
