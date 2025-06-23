const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const BlogLockManager = require("./services/BlogLockManager");
const BlogRoomManager = require("./services/BlogRoomManager");
const UserSessionManager = require("./services/UserSessionManager");

class SocketServer {
	constructor(httpServer) {
		this.io = new Server(httpServer, {
			cors: {
				origin: process.env.FRONTEND_URL || "http://localhost:3000",
				methods: ["GET", "POST"],
				credentials: true,
			},
			transports: ["websocket", "polling"],
		});

		this.lockManager = new BlogLockManager();
		this.roomManager = new BlogRoomManager();
		this.sessionManager = new UserSessionManager();

		this.setupMiddleware();
		this.setupConnectionHandling();
	}

	setupMiddleware() {
		// Authentication middleware
		this.io.use(async (socket, next) => {
			try {
				const token =
					socket.handshake.auth.token ||
					socket.handshake.headers.authorization?.split(" ")[1];

				if (!token) {
					return next(new Error("Authentication token required"));
				}

				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const user = await User.findById(decoded.userId);

				if (!user) {
					return next(new Error("User not found"));
				}

				socket.user = user;
				socket.userId = user.id;
				next();
			} catch (error) {
				next(new Error("Authentication failed"));
			}
		});
	}

	setupConnectionHandling() {
		this.io.on("connection", (socket) => {
			console.log(`User ${socket.user.name} connected: ${socket.id}`);

			// Register user session
			this.sessionManager.addUserSession(socket.userId, socket.id);

			// Handle blog room events
			this.handleBlogRoomEvents(socket);

			// Handle lock management events
			this.handleLockEvents(socket);

			// Handle collaboration events
			this.handleCollaborationEvents(socket);

			// Handle disconnection
			this.handleDisconnection(socket);
		});
	}

	handleBlogRoomEvents(socket) {
		// Join blog room
		socket.on("join-blog-room", async (blogId) => {
			try {
				// Verify user has access to this blog
				const hasAccess = await this.verifyBlogAccess(
					socket.userId,
					blogId
				);
				if (!hasAccess) {
					socket.emit("error", {
						message: "Access denied to this blog",
					});
					return;
				}

				// Join room
				socket.join(`blog-${blogId}`);
				this.roomManager.addUserToRoom(
					blogId,
					socket.userId,
					socket.user.name
				);

				// Notify others about new viewer
				socket.to(`blog-${blogId}`).emit("user-joined-blog", {
					userId: socket.userId,
					userName: socket.user.name,
					timestamp: new Date(),
				});

				// Send current lock status to the joining user
				const lockStatus = await this.lockManager.getLockStatus(blogId);
				socket.emit("lock-status-update", {
					blogId,
					...lockStatus,
				});

				// Send list of current active users
				const activeUsers = this.roomManager.getRoomUsers(blogId);
				socket.emit("active-users-update", {
					blogId,
					activeUsers,
				});

				console.log(
					`User ${socket.user.name} joined blog room ${blogId}`
				);
			} catch (error) {
				socket.emit("error", { message: "Failed to join blog room" });
			}
		});

		// Leave blog room
		socket.on("leave-blog-room", (blogId) => {
			socket.leave(`blog-${blogId}`);
			this.roomManager.removeUserFromRoom(blogId, socket.userId);

			// Notify others
			socket.to(`blog-${blogId}`).emit("user-left-blog", {
				userId: socket.userId,
				userName: socket.user.name,
				timestamp: new Date(),
			});

			console.log(`User ${socket.user.name} left blog room ${blogId}`);
		});
	}

	handleLockEvents(socket) {
		// Request lock
		socket.on("request-lock", async (data) => {
			const { blogId, reason = "editing", duration = 30 } = data;

			try {
				const result = await this.lockManager.acquireLock(
					blogId,
					socket.userId,
					{
						reason,
						duration,
						userSocket: socket.id,
					}
				);

				if (result.success) {
					// Notify the requester
					socket.emit("lock-acquired", {
						blogId,
						lockId: result.lockId,
						expiresAt: result.expiresAt,
						duration,
					});

					// Notify all others in the room
					socket.to(`blog-${blogId}`).emit("lock-status-changed", {
						blogId,
						isLocked: true,
						lockedBy: socket.userId,
						lockedByName: socket.user.name,
						lockId: result.lockId,
						expiresAt: result.expiresAt,
						reason,
					});

					// Start lock heartbeat monitoring
					this.startLockHeartbeat(socket, blogId, result.lockId);
				} else {
					socket.emit("lock-denied", {
						blogId,
						reason: result.reason,
						currentLock: result.currentLock,
					});
				}
			} catch (error) {
				socket.emit("error", { message: "Failed to acquire lock" });
			}
		});

		// Release lock
		socket.on("release-lock", async (data) => {
			const { blogId } = data;

			try {
				const result = await this.lockManager.releaseLock(
					blogId,
					socket.userId
				);

				if (result.success) {
					// Notify the releaser
					socket.emit("lock-released", {
						blogId,
						releasedAt: new Date(),
					});

					// Notify all others in the room
					socket.to(`blog-${blogId}`).emit("lock-status-changed", {
						blogId,
						isLocked: false,
						releasedBy: socket.userId,
						releasedByName: socket.user.name,
						releasedAt: new Date(),
					});

					// Stop heartbeat
					this.stopLockHeartbeat(socket, blogId);
				} else {
					socket.emit("error", { message: result.reason });
				}
			} catch (error) {
				socket.emit("error", { message: "Failed to release lock" });
			}
		});

		// Extend lock (heartbeat)
		socket.on("extend-lock", async (data) => {
			const { blogId, duration = 30 } = data;

			try {
				const result = await this.lockManager.extendLock(
					blogId,
					socket.userId,
					duration
				);

				if (result.success) {
					socket.emit("lock-extended", {
						blogId,
						newExpiresAt: result.expiresAt,
					});

					// Notify others about extension
					socket.to(`blog-${blogId}`).emit("lock-status-changed", {
						blogId,
						isLocked: true,
						lockedBy: socket.userId,
						lockedByName: socket.user.name,
						expiresAt: result.expiresAt,
						extended: true,
					});
				} else {
					socket.emit("lock-extension-failed", {
						blogId,
						reason: result.reason,
					});
				}
			} catch (error) {
				socket.emit("error", { message: "Failed to extend lock" });
			}
		});

		// Force unlock (admin only)
		socket.on("force-unlock", async (data) => {
			const { blogId } = data;

			try {
				// Check admin permissions
				if (!socket.user.isAdmin) {
					socket.emit("error", {
						message: "Admin privileges required",
					});
					return;
				}

				const result = await this.lockManager.forceUnlock(
					blogId,
					socket.userId
				);

				if (result.success) {
					// Notify all users in the room
					this.io.to(`blog-${blogId}`).emit("lock-status-changed", {
						blogId,
						isLocked: false,
						forcedBy: socket.userId,
						forcedByName: socket.user.name,
						forced: true,
						timestamp: new Date(),
					});

					// Notify the previous lock holder specifically
					if (result.previousLockHolder) {
						const holderSockets =
							this.sessionManager.getUserSockets(
								result.previousLockHolder
							);
						holderSockets.forEach((socketId) => {
							this.io.to(socketId).emit("lock-force-released", {
								blogId,
								forcedByName: socket.user.name,
								message:
									"Your editing session was ended by an administrator",
							});
						});
					}
				}
			} catch (error) {
				socket.emit("error", { message: "Failed to force unlock" });
			}
		});
	}

	handleCollaborationEvents(socket) {
		// Add collaborator
		socket.on("add-collaborator", async (data) => {
			const { blogId, email, role } = data;

			try {
				// Add collaborator via your existing service
				const result = await BlogService.addCollaborator(
					blogId,
					email,
					role,
					socket.userId
				);

				if (result.success) {
					// Notify all users in the room
					socket.to(`blog-${blogId}`).emit("collaborator-added", {
						blogId,
						collaborator: result.collaborator,
						addedBy: socket.user.name,
						timestamp: new Date(),
					});

					socket.emit("collaborator-add-success", {
						collaborator: result.collaborator,
					});
				}
			} catch (error) {
				socket.emit("error", { message: "Failed to add collaborator" });
			}
		});

		// Request edit access
		socket.on("request-edit-access", async (data) => {
			const { blogId, message } = data;

			try {
				const lockStatus = await this.lockManager.getLockStatus(blogId);

				if (lockStatus.isLocked) {
					// Notify the current lock holder
					const holderSockets = this.sessionManager.getUserSockets(
						lockStatus.lockedBy
					);
					holderSockets.forEach((socketId) => {
						this.io.to(socketId).emit("edit-access-requested", {
							blogId,
							requestedBy: socket.userId,
							requestedByName: socket.user.name,
							message,
							timestamp: new Date(),
						});
					});

					socket.emit("edit-access-request-sent", {
						blogId,
						sentTo: lockStatus.lockedByName,
					});
				}
			} catch (error) {
				socket.emit("error", {
					message: "Failed to request edit access",
				});
			}
		});

		// Grant edit access
		socket.on("grant-edit-access", async (data) => {
			const { blogId, grantedTo } = data;

			try {
				// Release current lock
				await this.lockManager.releaseLock(blogId, socket.userId);

				// Notify the granted user
				const grantedSockets =
					this.sessionManager.getUserSockets(grantedTo);
				grantedSockets.forEach((socketId) => {
					this.io.to(socketId).emit("edit-access-granted", {
						blogId,
						grantedBy: socket.user.name,
						timestamp: new Date(),
					});
				});

				// Notify room about lock release
				socket.to(`blog-${blogId}`).emit("lock-status-changed", {
					blogId,
					isLocked: false,
					releasedBy: socket.userId,
					releasedByName: socket.user.name,
					grantedAccess: true,
				});
			} catch (error) {
				socket.emit("error", {
					message: "Failed to grant edit access",
				});
			}
		});
	}

	handleDisconnection(socket) {
		socket.on("disconnect", async (reason) => {
			console.log(`User ${socket.user.name} disconnected: ${reason}`);

			try {
				// Remove from session manager
				this.sessionManager.removeUserSession(socket.userId, socket.id);

				// Check if user has any active locks and release them
				const userLocks = await this.lockManager.getUserActiveLocks(
					socket.userId
				);

				for (const lock of userLocks) {
					await this.lockManager.releaseLock(
						lock.blogId,
						socket.userId
					);

					// Notify room about lock release due to disconnection
					socket
						.to(`blog-${lock.blogId}`)
						.emit("lock-status-changed", {
							blogId: lock.blogId,
							isLocked: false,
							releasedBy: socket.userId,
							releasedByName: socket.user.name,
							reason: "user_disconnected",
							timestamp: new Date(),
						});
				}

				// Remove from all blog rooms
				const userRooms = this.roomManager.getUserRooms(socket.userId);
				userRooms.forEach((blogId) => {
					this.roomManager.removeUserFromRoom(blogId, socket.userId);

					socket.to(`blog-${blogId}`).emit("user-left-blog", {
						userId: socket.userId,
						userName: socket.user.name,
						reason: "disconnected",
						timestamp: new Date(),
					});
				});
			} catch (error) {
				console.error("Error handling disconnection:", error);
			}
		});
	}

	startLockHeartbeat(socket, blogId, lockId) {
		const heartbeatKey = `${blogId}-${socket.userId}`;

		// Clear existing heartbeat if any
		if (socket.lockHeartbeats) {
			clearInterval(socket.lockHeartbeats[heartbeatKey]);
		} else {
			socket.lockHeartbeats = {};
		}

		// Start new heartbeat - check every 2 minutes, lock expires in 30 minutes
		socket.lockHeartbeats[heartbeatKey] = setInterval(async () => {
			try {
				const lockStatus = await this.lockManager.getLockStatus(blogId);

				if (
					!lockStatus.isLocked ||
					lockStatus.lockedBy !== socket.userId
				) {
					// Lock was lost somehow
					this.stopLockHeartbeat(socket, blogId);
					socket.emit("lock-lost", {
						blogId,
						reason: "Lock was released or taken by another user",
					});
				}
			} catch (error) {
				console.error("Heartbeat check failed:", error);
			}
		}, 2 * 60 * 1000); // 2 minutes
	}

	stopLockHeartbeat(socket, blogId) {
		const heartbeatKey = `${blogId}-${socket.userId}`;

		if (socket.lockHeartbeats && socket.lockHeartbeats[heartbeatKey]) {
			clearInterval(socket.lockHeartbeats[heartbeatKey]);
			delete socket.lockHeartbeats[heartbeatKey];
		}
	}

	async verifyBlogAccess(userId, blogId) {
		// Implement your blog access verification logic
		try {
			const blog = await Blog.findById(blogId);
			if (!blog) return false;

			// Check if user is owner or collaborator
			return (
				blog.ownerId === userId ||
				blog.collaborators.some((c) => c.userId === userId)
			);
		} catch (error) {
			return false;
		}
	}
}

module.exports = SocketServer;

// ===== 2. BLOG LOCK MANAGER SERVICE =====
// server/websocket/services/BlogLockManager.js

const Redis = require("redis");

class BlogLockManager {
	constructor() {
		this.redis = Redis.createClient({
			host: process.env.REDIS_HOST || "localhost",
			port: process.env.REDIS_PORT || 6379,
		});
		this.redis.connect();
	}

	async acquireLock(blogId, userId, options = {}) {
		const lockKey = `blog_lock:${blogId}`;
		const lockId = `${userId}_${Date.now()}`;
		const duration = (options.duration || 30) * 60; // Convert minutes to seconds

		try {
			// Try to acquire lock atomically
			const result = await this.redis.set(
				lockKey,
				JSON.stringify({
					lockId,
					userId,
					userName: options.userName || "Unknown",
					reason: options.reason || "editing",
					acquiredAt: new Date().toISOString(),
					expiresAt: new Date(
						Date.now() + duration * 1000
					).toISOString(),
					userSocket: options.userSocket,
				}),
				{
					EX: duration, // Expire after duration seconds
					NX: true, // Only set if key doesn't exist
				}
			);

			if (result === "OK") {
				return {
					success: true,
					lockId,
					expiresAt: new Date(Date.now() + duration * 1000),
				};
			} else {
				// Lock already exists, get current lock info
				const currentLock = await this.getLockStatus(blogId);
				return {
					success: false,
					reason: "Blog is already locked",
					currentLock,
				};
			}
		} catch (error) {
			throw new Error("Failed to acquire lock: " + error.message);
		}
	}

	async releaseLock(blogId, userId) {
		const lockKey = `blog_lock:${blogId}`;

		try {
			const lockData = await this.redis.get(lockKey);

			if (!lockData) {
				return {
					success: true,
					reason: "No lock exists",
				};
			}

			const lock = JSON.parse(lockData);

			if (lock.userId !== userId) {
				return {
					success: false,
					reason: "You do not own this lock",
				};
			}

			await this.redis.del(lockKey);

			return {
				success: true,
				releasedAt: new Date(),
			};
		} catch (error) {
			throw new Error("Failed to release lock: " + error.message);
		}
	}

	async extendLock(blogId, userId, duration = 30) {
		const lockKey = `blog_lock:${blogId}`;
		const durationSeconds = duration * 60;

		try {
			const lockData = await this.redis.get(lockKey);

			if (!lockData) {
				return {
					success: false,
					reason: "No lock exists to extend",
				};
			}

			const lock = JSON.parse(lockData);

			if (lock.userId !== userId) {
				return {
					success: false,
					reason: "You do not own this lock",
				};
			}

			// Update expiration
			const newExpiresAt = new Date(Date.now() + durationSeconds * 1000);
			lock.expiresAt = newExpiresAt.toISOString();
			lock.lastExtended = new Date().toISOString();

			await this.redis.set(lockKey, JSON.stringify(lock), {
				EX: durationSeconds,
			});

			return {
				success: true,
				expiresAt: newExpiresAt,
			};
		} catch (error) {
			throw new Error("Failed to extend lock: " + error.message);
		}
	}

	async forceUnlock(blogId, adminUserId) {
		const lockKey = `blog_lock:${blogId}`;

		try {
			const lockData = await this.redis.get(lockKey);
			let previousLockHolder = null;

			if (lockData) {
				const lock = JSON.parse(lockData);
				previousLockHolder = lock.userId;
			}

			await this.redis.del(lockKey);

			return {
				success: true,
				previousLockHolder,
				forcedBy: adminUserId,
				forcedAt: new Date(),
			};
		} catch (error) {
			throw new Error("Failed to force unlock: " + error.message);
		}
	}

	async getLockStatus(blogId) {
		const lockKey = `blog_lock:${blogId}`;

		try {
			const lockData = await this.redis.get(lockKey);

			if (!lockData) {
				return {
					isLocked: false,
					blogId,
				};
			}

			const lock = JSON.parse(lockData);

			return {
				isLocked: true,
				blogId,
				lockedBy: lock.userId,
				lockedByName: lock.userName,
				lockId: lock.lockId,
				reason: lock.reason,
				acquiredAt: lock.acquiredAt,
				expiresAt: lock.expiresAt,
			};
		} catch (error) {
			throw new Error("Failed to get lock status: " + error.message);
		}
	}

	async getUserActiveLocks(userId) {
		try {
			// Get all blog lock keys
			const keys = await this.redis.keys("blog_lock:*");
			const userLocks = [];

			for (const key of keys) {
				const lockData = await this.redis.get(key);
				if (lockData) {
					const lock = JSON.parse(lockData);
					if (lock.userId === userId) {
						userLocks.push({
							blogId: key.replace("blog_lock:", ""),
							...lock,
						});
					}
				}
			}

			return userLocks;
		} catch (error) {
			throw new Error("Failed to get user locks: " + error.message);
		}
	}
}

module.exports = BlogLockManager;

// ===== 3. ROOM MANAGER SERVICE =====
// server/websocket/services/BlogRoomManager.js

class BlogRoomManager {
	constructor() {
		this.rooms = new Map(); // blogId -> Set of users
		this.userRooms = new Map(); // userId -> Set of blogIds
	}

	addUserToRoom(blogId, userId, userName) {
		// Add to blog room
		if (!this.rooms.has(blogId)) {
			this.rooms.set(blogId, new Map());
		}
		this.rooms.get(blogId).set(userId, {
			userId,
			userName,
			joinedAt: new Date(),
		});

		// Add to user's room list
		if (!this.userRooms.has(userId)) {
			this.userRooms.set(userId, new Set());
		}
		this.userRooms.get(userId).add(blogId);
	}

	removeUserFromRoom(blogId, userId) {
		// Remove from blog room
		if (this.rooms.has(blogId)) {
			this.rooms.get(blogId).delete(userId);

			// Clean up empty room
			if (this.rooms.get(blogId).size === 0) {
				this.rooms.delete(blogId);
			}
		}

		// Remove from user's room list
		if (this.userRooms.has(userId)) {
			this.userRooms.get(userId).delete(blogId);

			// Clean up empty user entry
			if (this.userRooms.get(userId).size === 0) {
				this.userRooms.delete(userId);
			}
		}
	}

	getRoomUsers(blogId) {
		if (!this.rooms.has(blogId)) {
			return [];
		}

		return Array.from(this.rooms.get(blogId).values());
	}

	getUserRooms(userId) {
		if (!this.userRooms.has(userId)) {
			return [];
		}

		return Array.from(this.userRooms.get(userId));
	}

	getRoomCount(blogId) {
		return this.rooms.has(blogId) ? this.rooms.get(blogId).size : 0;
	}
}

module.exports = BlogRoomManager;

// ===== 4. USER SESSION MANAGER =====
// server/websocket/services/UserSessionManager.js

class UserSessionManager {
	constructor() {
		this.userSessions = new Map(); // userId -> Set of socketIds
	}

	addUserSession(userId, socketId) {
		if (!this.userSessions.has(userId)) {
			this.userSessions.set(userId, new Set());
		}
		this.userSessions.get(userId).add(socketId);
	}

	removeUserSession(userId, socketId) {
		if (this.userSessions.has(userId)) {
			this.userSessions.get(userId).delete(socketId);

			// Clean up if no more sessions
			if (this.userSessions.get(userId).size === 0) {
				this.userSessions.delete(userId);
			}
		}
	}

	getUserSockets(userId) {
		if (!this.userSessions.has(userId)) {
			return [];
		}

		return Array.from(this.userSessions.get(userId));
	}

	isUserOnline(userId) {
		return (
			this.userSessions.has(userId) &&
			this.userSessions.get(userId).size > 0
		);
	}
}

module.exports = UserSessionManager;

// ===== 5. INTEGRATION WITH EXPRESS SERVER =====
// server/app.js (or server.js)

const express = require("express");
const http = require("http");
const SocketServer = require("./websocket/socketServer");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const socketServer = new SocketServer(server);

// Your existing routes...
app.use("/api", require("./routes"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log("WebSocket server initialized for blog concurrency");
});
