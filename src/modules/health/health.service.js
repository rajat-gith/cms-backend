const pool = require("../../db");
const redis = require("../../utils/redisClient");

class HealthService {
	static async checkDatabase() {
		const start = Date.now();
		try {
			await pool.query("SELECT 1");
			const responseTimeMs = Date.now() - start;
			return {
				status: "up",
				responseTimeMs,
			};
		} catch (error) {
			return {
				status: "down",
				error: error.message,
			};
		}
	}

	static async checkRedis() {
		const start = Date.now();
		try {
			if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
				return {
					status: "unconfigured",
					message: "Redis environment variables not set",
				};
			}
			const pong = await redis.ping();
			const responseTimeMs = Date.now() - start;
			return {
				status: pong === "PONG" || pong ? "up" : "down",
				responseTimeMs,
			};
		} catch (error) {
			return {
				status: "down",
				error: error.message,
			};
		}
	}

	static getSystemMetrics() {
		const memoryUsage = process.memoryUsage();
		return {
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: new Date().toISOString(),
			memoryUsage: {
				rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
				heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
				heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
			},
		};
	}
}

module.exports = HealthService;
