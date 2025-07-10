const amqp = require("amqplib");
const config = require("../../../config/index");

let channel;

async function getChannel() {
	if (channel) return channel;
	const conn = await amqp.connect(config.rabbitmq.url);
	channel = await conn.createChannel();
	return channel;
}

module.exports = { getChannel };
