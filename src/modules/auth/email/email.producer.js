const amqp = require("../mq/rabbitmq");

async function sendOTPMessage(email, otp) {
	try {
		if (!email || !otp) {
			throw new Error("Missing email or OTP payload");
		}

		const channel = await amqp.getChannel();

		if (!channel) {
			throw new Error("Failed to get RabbitMQ channel");
		}

		await channel.assertQueue("emailSendingQueue");

		let msg;
		try {
			msg = JSON.stringify({ email, otp });
		} catch (jsonError) {
			console.error("Failed to stringify OTP message:", {
				email,
				otp,
				error: jsonError.message,
			});
			throw new Error("Invalid OTP message payload");
		}

		channel.sendToQueue("emailSendingQueue", Buffer.from(msg));
		console.log(
			`Queued OTP message to emailSendingQueue → email: ${email}, otp: ${otp}`
		);
	} catch (error) {
		console.error("Failed to send OTP message to RabbitMQ:", {
			email,
			otp,
			error: error.message,
		});
		throw new Error("Could not queue OTP message");
	}
}

module.exports = { sendOTPMessage };
