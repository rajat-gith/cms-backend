const Blog = require("./blog.model");
const { STATES } = require("./blog.fsm");

class BlogLockService {
	static LOCK_DURATION = 10 * 60 * 1000; // 10 minutes
	static STALE_LOCK_THRESHOLD = 15 * 60 * 1000; // 15 minutes

	static async acquireLock(blogId, userId, lockReason = "editing") {
		const session = await Blog.startSession();
		session.startTransaction();

		try {
			// Find blog with current lock status
			const blog = await Blog.findById(blogId).session(session);
			if (!blog) {
				throw new Error("Blog not found");
			}

			const now = new Date();

			// Check if blog is already locked
			if (blog.lockedBy && blog.lockExpiresAt > now) {
				// Check if it's locked by the same user
				if (String(blog.lockedBy) === String(userId)) {
					// Extend the lock
					blog.lockExpiresAt = new Date(
						now.getTime() + this.LOCK_DURATION
					);
					await blog.save({ session });
					await session.commitTransaction();
					return { success: true, message: "Lock extended", blog };
				} else {
					await session.abortTransaction();
					return {
						success: false,
						message: "Blog is locked by another user",
						lockedBy: blog.lockedBy,
						lockExpiresAt: blog.lockExpiresAt,
					};
				}
			}

			// Clean up expired locks
			if (blog.lockedBy && blog.lockExpiresAt <= now) {
				await this.releaseLock(blogId, blog.lockedBy, session);
			}

			// Acquire new lock
			blog.lockedBy = userId;
			blog.lockedAt = now;
			blog.lockExpiresAt = new Date(now.getTime() + this.LOCK_DURATION);
			blog.lockReason = lockReason;

			await blog.save({ session });
			await session.commitTransaction();

			return { success: true, message: "Lock acquired", blog };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	static async releaseLock(blogId, userId, session = null) {
		const useSession = session || (await Blog.startSession());
		if (!session) useSession.startTransaction();

		try {
			const blog = await Blog.findById(blogId).session(useSession);
			if (!blog) {
				throw new Error("Blog not found");
			}

			// Only the lock owner or admin can release the lock
			if (blog.lockedBy && String(blog.lockedBy) !== String(userId)) {
				// Check if user is admin
				const userRole = await this.getUserRole(blog, userId);
				if (userRole !== "admin") {
					throw new Error("Unauthorized to release lock");
				}
			}

			blog.lockedBy = null;
			blog.lockedAt = null;
			blog.lockExpiresAt = null;
			blog.lockReason = null;

			await blog.save({ session: useSession });

			if (!session) await useSession.commitTransaction();
			return blog;
		} catch (error) {
			if (!session) await useSession.abortTransaction();
			throw error;
		} finally {
			if (!session) useSession.endSession();
		}
	}

	static async checkLockStatus(blogId) {
		const blog = await Blog.findById(blogId);
		if (!blog) return { locked: false };

		const now = new Date();
		if (blog.lockedBy && blog.lockExpiresAt > now) {
			return {
				locked: true,
				lockedBy: blog.lockedBy,
				lockExpiresAt: blog.lockExpiresAt,
				lockReason: blog.lockReason,
			};
		}

		// Clean up expired lock
		if (blog.lockedBy && blog.lockExpiresAt <= now) {
			await this.releaseLock(blogId, blog.lockedBy);
		}

		return { locked: false };
	}

	static async getUserRole(blog, userId) {
		if (String(blog.author.userId) === String(userId)) return "admin";
		const collaborator = blog.collaborators.find(
			(c) => String(c.userId) === String(userId)
		);
		return collaborator?.role || "viewer";
	}

	static async cleanupExpiredLocks() {
		const now = new Date();
		const expiredLocks = await Blog.find({
			lockedBy: { $exists: true },
			lockExpiresAt: { $lte: now },
		});

		for (const blog of expiredLocks) {
			await this.releaseLock(blog._id, blog.lockedBy);
		}

		return expiredLocks.length;
	}
}

module.exports = BlogLockService;
