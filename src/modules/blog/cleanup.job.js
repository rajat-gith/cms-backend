const BlogLockService = require("./blog.lock.service");

async function cleanupExpiredLocks() {
	try {
		const cleanedCount = await BlogLockService.cleanupExpiredLocks();
		console.log(`Cleaned up ${cleanedCount} expired locks`);
	} catch (error) {
		console.error("Error cleaning up expired locks:", error);
	}
}
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

module.exports = { cleanupExpiredLocks };
