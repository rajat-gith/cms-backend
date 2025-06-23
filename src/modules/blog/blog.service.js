const Blog = require("./blog.model");
const User = require("../user/user.model");
const { transitionState } = require("./blog.transition");
const BlogLockService = require("./blog.lock.service.js");
const BlogConflictService = require("./blog.conflict.service");

class BlogService {
	static async createBlog(data) {
		const blog = new Blog({
			...data,
			state: "draft",
			lastModifiedBy: data.author.userId,
		});
		return await blog.save();
	}

	static async getAllBlogs(userId) {
		return await Blog.find({
			$or: [
				{ "author.userId": userId },
				{ "collaborators.userId": userId },
			],
		}).populate("lockedBy", "username email");
	}

	static async getBlogById(blogId) {
		return await Blog.findById(blogId)
			.populate("lockedBy", "username email")
			.populate("lastModifiedBy", "username email");
	}

	static async updateBlog(blogId, userId, updates, expectedVersion) {
		// Check for conflicts before updating
		const conflict = await BlogConflictService.detectConflict(
			blogId,
			userId,
			expectedVersion,
			updates
		);

		if (conflict.hasConflict) {
			throw new Error(`Conflict detected: ${conflict.conflictType}`);
		}

		const session = await Blog.startSession();
		session.startTransaction();

		try {
			const blog = await Blog.findById(blogId).session(session);
			if (!blog) throw new Error("Blog not found");

			// Verify user has edit permissions
			const userRole = await BlogLockService.getUserRole(blog, userId);
			if (!["admin", "editor"].includes(userRole)) {
				throw new Error("Insufficient permissions to edit blog");
			}

			// Check if blog is locked by someone else
			const lockStatus = await BlogLockService.checkLockStatus(blogId);
			if (
				lockStatus.locked &&
				String(lockStatus.lockedBy) !== String(userId)
			) {
				throw new Error("Blog is locked by another user");
			}

			// Apply updates
			Object.assign(blog, updates);
			blog.lastModifiedBy = userId;

			// Log the change
			blog.changeHistory.push({
				userId,
				action: "content_updated",
				timestamp: new Date(),
				changes: updates,
			});

			await blog.save({ session });
			await session.commitTransaction();

			return blog;
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	static async deleteBlog(blogId, userId) {
		const blog = await Blog.findById(blogId);
		if (!blog) throw new Error("Blog not found");

		// Only admin (author) can delete
		if (String(blog.author.userId) !== String(userId)) {
			throw new Error("Only the author can delete the blog");
		}

		// Check if blog is locked
		const lockStatus = await BlogLockService.checkLockStatus(blogId);
		if (
			lockStatus.locked &&
			String(lockStatus.lockedBy) !== String(userId)
		) {
			throw new Error("Cannot delete locked blog");
		}

		return await Blog.findByIdAndDelete(blogId);
	}

	static async getUserName(userId) {
		const user = await User.findById(userId);
		return user?.username;
	}

	static async addCollaborator(blogId, userId, collaboratorId, role) {
		const session = await Blog.startSession();
		session.startTransaction();

		try {
			const blog = await Blog.findById(blogId).session(session);
			if (!blog) throw new Error("Blog not found");

			if (String(blog.author.userId) !== String(userId)) {
				throw new Error("Only the author can add collaborators");
			}

			const exists = blog.collaborators.some(
				(c) => String(c.userId) === String(collaboratorId)
			);
			if (exists) throw new Error("Collaborator already exists");

			blog.collaborators.push({ userId: collaboratorId, role });

			// Log the change
			blog.changeHistory.push({
				userId,
				action: "collaborator_added",
				timestamp: new Date(),
				changes: { collaboratorId, role },
			});

			await blog.save({ session });
			await session.commitTransaction();

			return blog;
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	static async performTransition(blogId, event, user) {
		const blog = await Blog.findById(blogId);
		if (!blog) throw new Error("Blog not found");

		return await transitionState(blog, event, user);
	}

	// Lock management methods
	static async acquireLock(blogId, userId, reason = "editing") {
		return await BlogLockService.acquireLock(blogId, userId, reason);
	}

	static async releaseLock(blogId, userId) {
		return await BlogLockService.releaseLock(blogId, userId);
	}

	static async getLockStatus(blogId) {
		return await BlogLockService.checkLockStatus(blogId);
	}

	// Conflict resolution methods
	static async checkForConflicts(blogId, userId, expectedVersion, changes) {
		return await BlogConflictService.detectConflict(
			blogId,
			userId,
			expectedVersion,
			changes
		);
	}

	static async resolveConflict(blogId, userId, resolution) {
		return await BlogConflictService.resolveConflict(
			blogId,
			userId,
			resolution
		);
	}
}

module.exports = BlogService;
