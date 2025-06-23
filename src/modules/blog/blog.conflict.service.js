const Blog = require("./blog.model");
const BlogLockService = require("./blog.lock.service.js");

class BlogConflictService {
	static async detectConflict(blogId, userId, expectedVersion, changes) {
		const blog = await Blog.findById(blogId);
		if (!blog) throw new Error("Blog not found");

		// Version-based conflict detection
		if (blog.version !== expectedVersion) {
			return {
				hasConflict: true,
				conflictType: "version_mismatch",
				currentVersion: blog.version,
				expectedVersion,
				conflictingChanges: await this.getConflictingChanges(
					blog,
					changes
				),
			};
		}

		// Lock-based conflict detection
		const lockStatus = await BlogLockService.checkLockStatus(blogId);
		if (
			lockStatus.locked &&
			String(lockStatus.lockedBy) !== String(userId)
		) {
			return {
				hasConflict: true,
				conflictType: "concurrent_edit",
				lockedBy: lockStatus.lockedBy,
				lockExpiresAt: lockStatus.lockExpiresAt,
			};
		}

		return { hasConflict: false };
	}

	static async getConflictingChanges(blog, incomingChanges) {
		const conflictingFields = [];

		// Check for field-level conflicts
		for (const [field, newValue] of Object.entries(incomingChanges)) {
			if (blog[field] && blog[field] !== newValue) {
				conflictingFields.push({
					field,
					currentValue: blog[field],
					incomingValue: newValue,
				});
			}
		}

		return conflictingFields;
	}

	static async resolveConflict(blogId, userId, resolution) {
		const session = await Blog.startSession();
		session.startTransaction();

		try {
			const blog = await Blog.findById(blogId).session(session);
			if (!blog) throw new Error("Blog not found");

			// Verify user has permission to resolve conflicts
			const userRole = await BlogLockService.getUserRole(blog, userId);
			if (userRole !== "admin") {
				throw new Error("Only admins can resolve conflicts");
			}

			switch (resolution.strategy) {
				case "accept_current":
					// Keep current version, reject incoming changes
					break;

				case "accept_incoming":
					// Apply incoming changes
					Object.assign(blog, resolution.changes);
					break;

				case "manual_merge":
					// Apply manually merged changes
					Object.assign(blog, resolution.mergedChanges);
					break;

				default:
					throw new Error("Invalid conflict resolution strategy");
			}

			// Log the resolution
			blog.changeHistory.push({
				userId,
				action: "conflict_resolved",
				timestamp: new Date(),
				changes: resolution,
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
}

module.exports = BlogConflictService;
