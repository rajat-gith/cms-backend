const amqp = require("../mq/rabbitmq");
const { sendEmail } = require("./sesClient");

async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Sending email attempt ${attempt}/${maxRetries}`);
			return await sendEmail(mailOptions);
		} catch (error) {
			console.error(
				`Email send attempt ${attempt} failed:`,
				error.message
			);
			if (attempt === maxRetries) {
				throw new Error(
					`Failed to send email after ${maxRetries} attempts`
				);
			}
			const delay = Math.pow(2, attempt) * 1000;
			console.log(`⏳ Retrying in ${delay}ms...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}

async function startConsumer() {
	try {
		const channel = await amqp.getChannel();
		if (!channel) throw new Error("Failed to connect to RabbitMQ");

		const queueName = "emailSendingQueue";
		await channel.assertQueue(queueName, { durable: true });
		await channel.prefetch(1);

		console.log(`Listening on queue: ${queueName}`);

		channel.consume(queueName, async (msg) => {
			if (!msg) return;

			try {
				const { email, otp } = JSON.parse(msg.content.toString());

				const mailOptions = {
					to: email,
					subject: "Your OTP Code",
					text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
					html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
				};

				await sendEmailWithRetry(mailOptions, 3);
				channel.ack(msg);
				console.log(`Email sent and acked: ${email}`);
			} catch (err) {
				console.error(" Error processing message:", err.message);
				channel.nack(msg, false, false);
			}
		});
	} catch (err) {
		console.error(" Consumer start failed:", err.message);
		process.exit(1);
	}
}

process.on("SIGTERM", () => {
	console.log("SIGTERM received. Exiting...");
	process.exit(0);
});
process.on("SIGINT", () => {
	console.log("SIGINT received. Exiting...");
	process.exit(0);
});

module.exports = startConsumer;
