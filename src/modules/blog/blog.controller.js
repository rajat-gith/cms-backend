const BlogService = require("./blog.service");
const UserService = require("../user/user.service");

const BlogController = {
	async createBlog(req, res) {
		try {
			const authorName = await BlogService.getUserName(req.user.userId);
			const blog = await BlogService.createBlog({
				...req.body,
				author: {
					name: authorName || "Anonymous",
					userId: req.user.userId,
				},
			});
			res.status(201).json({ message: "Blog created", blog });
		} catch (err) {
			res.status(500).json({
				message: "Failed to create blog",
				error: err.message,
			});
		}
	},

	async getBlogs(req, res) {
		try {
			const blogs = await BlogService.getAllBlogs(req.user.userId);
			res.json(blogs);
		} catch (err) {
			res.status(500).json({
				message: "Failed to fetch blogs",
				error: err.message,
			});
		}
	},

	async getBlogById(req, res) {
		try {
			const blog = await BlogService.getBlogById(req.params.id);
			if (!blog)
				return res.status(404).json({ message: "Blog not found" });
			res.json(blog);
		} catch (err) {
			res.status(500).json({ message: "Error", error: err.message });
		}
	},

	async updateBlog(req, res) {
		try {
			const { expectedVersion, ...updates } = req.body;

			// Check for conflicts first
			if (expectedVersion) {
				const conflict = await BlogService.checkForConflicts(
					req.params.id,
					req.user.userId,
					expectedVersion,
					updates
				);

				if (conflict.hasConflict) {
					return res.status(409).json({
						message: "Conflict detected",
						conflict,
						resolution_required: true,
					});
				}
			}

			const blog = await BlogService.updateBlog(
				req.params.id,
				req.user.userId,
				updates,
				expectedVersion
			);

			res.json({ message: "Blog updated successfully", blog });
		} catch (err) {
			const statusCode = err.message.includes("Conflict")
				? 409
				: err.message.includes("permissions")
				? 403
				: err.message.includes("locked")
				? 423
				: 500;

			res.status(statusCode).json({
				message: "Failed to update blog",
				error: err.message,
			});
		}
	},

	async deleteBlog(req, res) {
		try {
			await BlogService.deleteBlog(req.params.id, req.user.userId);
			res.json({ message: "Deleted successfully" });
		} catch (err) {
			const statusCode = err.message.includes("permissions")
				? 403
				: err.message.includes("locked")
				? 423
				: 500;

			res.status(statusCode).json({
				message: "Error deleting",
				error: err.message,
			});
		}
	},

	async addCollaborator(req, res) {
		try {
			const { userEmail, role } = req.body;
			const collaborator = await UserService.findUserByEmail(userEmail);
			if (!collaborator) {
				return res.status(404).json({ message: "User not found" });
			}

			const blog = await BlogService.addCollaborator(
				req.params.id,
				req.user.userId,
				collaborator._id,
				role
			);
			res.json({ message: "Collaborator added", blog });
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	},

	async transition(req, res) {
		try {
			const blog = await BlogService.performTransition(
				req.params.id,
				req.body.event,
				req.user
			);
			res.json({ message: "State transitioned", blog });
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	},

	// Lock management endpoints
	async acquireLock(req, res) {
		try {
			const { reason } = req.body;
			const result = await BlogService.acquireLock(
				req.params.id,
				req.user.userId,
				reason
			);

			if (!result.success) {
				return res.status(423).json(result);
			}

			res.json(result);
		} catch (err) {
			res.status(500).json({
				message: "Failed to acquire lock",
				error: err.message,
			});
		}
	},

	async releaseLock(req, res) {
		try {
			const blog = await BlogService.releaseLock(
				req.params.id,
				req.user.userId
			);
			res.json({ message: "Lock released", blog });
		} catch (err) {
			res.status(400).json({
				message: "Failed to release lock",
				error: err.message,
			});
		}
	},

	async getLockStatus(req, res) {
		try {
			const lockStatus = await BlogService.getLockStatus(req.params.id);
			res.json(lockStatus);
		} catch (err) {
			res.status(500).json({
				message: "Failed to get lock status",
				error: err.message,
			});
		}
	},

	// Conflict resolution endpoints
	async resolveConflict(req, res) {
		try {
			const blog = await BlogService.resolveConflict(
				req.params.id,
				req.user.userId,
				req.body
			);
			res.json({ message: "Conflict resolved", blog });
		} catch (err) {
			res.status(400).json({
				message: "Failed to resolve conflict",
				error: err.message,
			});
		}
	},
};

module.exports = BlogController;
