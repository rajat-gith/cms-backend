const mongoose = require("mongoose");

const awardHonorSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		issuer: String,
		dateReceived: Date,
		description: String,
		certificateLink: String,
		category: String,
		location: String,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("AwardHonor", awardHonorSchema);
