const HealthService = require("./health.service");

class HealthController {
	static async getHealth(req, res) {
		try {
			const [dbStatus, redisStatus] = await Promise.all([
				HealthService.checkDatabase(),
				HealthService.checkRedis(),
			]);

			const metrics = HealthService.getSystemMetrics();

			const isHealthy = dbStatus.status === "up";
			const statusCode = isHealthy ? 200 : 503;

			res.status(statusCode).json({
				status: isHealthy ? "OK" : "DEGRADED",
				service: "cms-backend",
				...metrics,
				dependencies: {
					database: dbStatus,
					redis: redisStatus,
				},
			});
		} catch (error) {
			console.error("Health check error:", error);
			res.status(500).json({
				status: "ERROR",
				message: "Health check failed to execute.",
				error: error.message,
			});
		}
	}

	static getLiveness(req, res) {
		res.status(200).json({
			status: "UP",
			timestamp: new Date().toISOString(),
		});
	}

	static async getReadiness(req, res) {
		try {
			const dbStatus = await HealthService.checkDatabase();
			if (dbStatus.status === "up") {
				return res.status(200).json({
					status: "READY",
					timestamp: new Date().toISOString(),
				});
			}

			return res.status(503).json({
				status: "NOT_READY",
				reason: "Database connection failed",
				details: dbStatus,
			});
		} catch (error) {
			return res.status(503).json({
				status: "NOT_READY",
				error: error.message,
			});
		}
	}
}

module.exports = HealthController;
