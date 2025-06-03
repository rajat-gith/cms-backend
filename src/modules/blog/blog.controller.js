const BlogService = require("./blog.service");

const BlogController = {
	async createBlog(req, res) {
		try {
			const authorName = await BlogService.getUserName(req.user.userId);
			const data = {
				...req.body,
				author: {
					name: authorName || "Anonymous",
					userId: req.user.userId,
				},
			};
			const blog = await BlogService.createBlog(data);
			res.status(201).json({ message: "Blog created", data: blog });
		} catch (error) {
			res.status(500).json({ message: "Failed to create blog", error });
		}
	},

	async getBlogs(req, res) {
		try {
			const blogs = await BlogService.getAllBlogs(req.user.userId);
			res.json(blogs);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch blogs", error });
		}
	},

	async updateBlog(req, res) {
		try {
			const updated = await BlogService.updateBlog(
				req.params.id,
				req.body
			);
			res.json(updated);
		} catch (error) {
			res.status(500).json({ message: "Failed to update blog", error });
		}
	},

	async getBlogById(req, res) {
		try {
			const blog = await BlogService.getBlogById(req.params.id);
			if (!blog)
				return res.status(404).json({ message: "Blog not found" });
			res.json(blog);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch blog", error });
		}
	},

	async deleteBlog(req, res) {
		try {
			await BlogService.deleteBlog(req.params.id);
			res.json({ message: "Deleted successfully" });
		} catch (err) {
			res.status(500).json({
				message: "Failed to delete certification",
				error: err.message,
			});
		}
	},
};

module.exports = BlogController;
