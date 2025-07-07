const BlogService = require("./blog.service");

const BlogController = {
	async createBlog(req, res) {
		try {
			const authorName = await BlogService.getUserName(req.user.id);
			const blog = await BlogService.createBlog({
				...req.body,
				author: {
					name: authorName || "Anonymous",
					userId: req.user.id,
				},
			});
			res.status(201).json({
				success: true,
				message: "Blog created successfully",
				data: blog,
			});
		} catch (err) {
			const msg = err.message;
			const status =
				msg === "User not found"
					? 404
					: msg.includes("already exists")
					? 409
					: 500;
			res.status(status).json({ success: false, message: msg });
		}
	},

	async getBlogs(req, res) {
		try {
			const blogs = await BlogService.getAllBlogs(req.user.id);
			res.json({ success: true, count: blogs.length, data: blogs });
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},

	async getBlogById(req, res) {
		try {
			const blog = await BlogService.getBlogById(req.params.id);
			if (!blog)
				return res
					.status(404)
					.json({ success: false, message: "Blog not found" });
			if (blog.author.userId !== req.user.id && !blog.isPublished) {
				return res
					.status(403)
					.json({
						success: false,
						message: "Not authorized to view this blog",
					});
			}
			res.json({ success: true, data: blog });
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},

	async updateBlog(req, res) {
		try {
			const blog = await BlogService.getBlogById(req.params.id);
			if (!blog)
				return res
					.status(404)
					.json({ success: false, message: "Blog not found" });
			if (blog.author.userId !== req.user.id) {
				return res
					.status(403)
					.json({
						success: false,
						message: "Not authorized to update this blog",
					});
			}
			const updated = await BlogService.updateBlog(
				req.params.id,
				req.body
			);
			res.json({
				success: true,
				message: "Blog updated successfully",
				data: updated,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},

	async deleteBlog(req, res) {
		try {
			const blog = await BlogService.getBlogById(req.params.id);
			if (!blog)
				return res
					.status(404)
					.json({ success: false, message: "Blog not found" });
			if (blog.author.userId !== req.user.id) {
				return res
					.status(403)
					.json({
						success: false,
						message: "Not authorized to delete this blog",
					});
			}
			const result = await BlogService.deleteBlog(req.params.id);
			res.json({
				success: true,
				message: "Blog deleted successfully",
				data: result,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},

	async searchBlogs(req, res) {
		try {
			const { q } = req.query;
			if (!q)
				return res
					.status(400)
					.json({
						success: false,
						message: "Search term is required",
					});
			const blogs = await BlogService.searchBlogs(q, req.user.id);
			res.json({
				success: true,
				searchTerm: q,
				count: blogs.length,
				data: blogs,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},

	async getBlogStats(req, res) {
		try {
			const total = await BlogService.countUserBlogs(req.user.id);
			res.json({
				success: true,
				data: { totalBlogs: total, userId: req.user.id },
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	},
};

module.exports = BlogController;
