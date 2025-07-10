const app = require("./src/app");
const config = require("./src/config");
const connectDB = require("./src/utils/db");

// Import and start email consumer
const startEmailConsumer = require("./src/modules/auth/email/email.consumer");

async function bootstrap() {
	try {
		console.log("🚀 Starting application bootstrap...");

		// Optional: connectDB(); if you use Mongo
		// await connectDB();

		// Start email consumer BEFORE starting the server
		// This ensures the consumer is ready before any API calls
		console.log("📨 Initializing email consumer...");
		await startEmailConsumer();
		console.log("✅ Email consumer initialized and ready");

		// Add a small delay to ensure everything is properly initialized
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Start the server
		const server = app.listen(config.port, () => {
			console.log(`✅ Server running on http://localhost:${config.port}`);
			console.log(
				`🌐 Allowed Frontend URL: ${config.frontendDeployedUrl}`
			);
			console.log("🎯 Application bootstrap completed successfully");
		});

		// Graceful shutdown handling
		const gracefulShutdown = async (signal) => {
			console.log(
				`\n📡 Received ${signal}, starting graceful shutdown...`
			);

			server.close(() => {
				console.log("✅ HTTP server closed");
				process.exit(0);
			});
		};

		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));
	} catch (error) {
		console.error("❌ Failed to bootstrap application:", error.message);
		console.error("Stack trace:", error.stack);
		process.exit(1);
	}
}

bootstrap();
