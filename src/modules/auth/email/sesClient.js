const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const config = require("../../../config/index");

const sesClient = new SESClient({
	region: config.aws.region,
});

async function sendEmail({ to, subject, html, text }) {
	const params = {
		Source: config.email.from,
		Destination: {
			ToAddresses: [to],
		},
		Message: {
			Subject: { Data: subject },
			Body: {
				Html: { Data: html },
				Text: { Data: text || "" },
			},
		},
	};

	try {
		const command = new SendEmailCommand(params);
		const response = await sesClient.send(command);
		console.log(`Email sent to ${to}:`, response.MessageId);
		return response;
	} catch (err) {
		console.error("SES email sending failed:", err.message);
		throw err;
	}
}

module.exports = {
	sendEmail,
	sesClient,
};
