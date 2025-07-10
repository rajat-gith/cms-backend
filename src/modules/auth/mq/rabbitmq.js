const amqp = require("amqplib");

let channel;

async function getChannel() {
	if (channel) return channel;
	const conn = await amqp.connect(process.env.RABBITMQ_URL);
	channel = await conn.createChannel();
	return channel;
}

module.exports = { getChannel };
