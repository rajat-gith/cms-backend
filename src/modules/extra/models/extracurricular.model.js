const mongoose = require("mongoose");

const extracurricularSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		description: String,
		organization: String,
		period: {
			startDate: Date,
			endDate: Date,
			isOngoing: { type: Boolean, default: false },
		},
		location: String,
		mediaLink: String,
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

module.exports = mongoose.model("Extracurricular", extracurricularSchema);
