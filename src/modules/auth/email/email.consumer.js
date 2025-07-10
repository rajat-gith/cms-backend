require("dotenv").config(); // Ensures .env loads when run directly

const amqp = require("../mq/rabbitmq");
const nodemailer = require("nodemailer");
const config = require("../../../config");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.email.user,
		pass: config.email.pass,
	},
	pool: true, // Enable connection pooling
	maxConnections: 5,
	maxMessages: 10,
});

async function startConsumer() {
	try {
		console.log("Verifying email transporter...");

		// Verify transporter before starting consumer
		await transporter.verify();
		console.log("✔ Email transporter verified successfully");

		console.log("Connecting to RabbitMQ...");

		const channel = await amqp.getChannel();
		if (!channel) throw new Error("Could not establish RabbitMQ channel");

		console.log("✔ Connected to RabbitMQ");
		console.log("RabbitMQ channel established:", !!channel);

		const queueName = "emailSendingQueue";

		// List all queues by asserting some and observing
		console.log(`Asserting queue: ${queueName}`);
		await channel.assertQueue(queueName, { durable: true });
		console.log(`✔ Queue "${queueName}" is ready`);

		// Set prefetch to 1 to handle one message at a time
		await channel.prefetch(1);

		console.log("Setting up consumer...");
		channel.consume(queueName, async (msg) => {
			if (!msg) return;

			console.log(
				"Raw message received from queue:",
				msg?.content?.toString()
			);

			try {
				const data = JSON.parse(msg.content.toString());
				const { email, otp } = data;
				console.log(
					`Processing OTP email request: email=${email}, otp=${otp}`
				);

				// Send the email with retry logic
				const mailOptions = {
					from: config.email.from || config.email.user,
					to: email,
					subject: "Your OTP Code",
					text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
					html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
				};

				await sendEmailWithRetry(mailOptions, 3);
				console.log(`✅ Email sent successfully to ${email}`);

				// Acknowledge message only after successful send
				channel.ack(msg);
			} catch (err) {
				console.error(
					"❌ Error processing OTP email message:",
					err.message
				);

				// Reject message and don't requeue to prevent infinite loops
				channel.nack(msg, false, false);
			}
		});

		console.log(
			"✅ Email queue consumer started and listening for messages..."
		);
	} catch (error) {
		console.error("❌ Failed to start email consumer:", error.message);
		process.exit(1);
	}
}

async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Sending email attempt ${attempt}/${maxRetries}`);
			const info = await transporter.sendMail(mailOptions);
			console.log(`Email sent successfully: ${info.messageId}`);
			return info;
		} catch (error) {
			console.error(
				`Email send attempt ${attempt} failed:`,
				error.message
			);

			if (attempt === maxRetries) {
				throw new Error(
					`Failed to send email after ${maxRetries} attempts: ${error.message}`
				);
			}

			// Wait before retrying (exponential backoff)
			const delay = Math.pow(2, attempt) * 1000;
			console.log(`Waiting ${delay}ms before retry...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("Received SIGTERM, closing transporter...");
	transporter.close();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("Received SIGINT, closing transporter...");
	transporter.close();
	process.exit(0);
});

module.exports = startConsumer;
