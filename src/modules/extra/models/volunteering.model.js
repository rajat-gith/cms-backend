const mongoose = require("mongoose");

const volunteeringSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		role: { type: String, required: true },
		organization: { type: String, required: true },
		cause: String,
		period: {
			startDate: Date,
			endDate: Date,
			isOngoing: { type: Boolean, default: false },
		},
		description: String,
		location: String,
		website: String,
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

module.exports = mongoose.model("Volunteering", volunteeringSchema);
