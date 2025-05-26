const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		company: { type: String, required: true },
		location: String,
		employmentType: {
			type: String,
			enum: [
				"Full-time",
				"Part-time",
				"Internship",
				"Contract",
				"Freelance",
				"Self-employed",
			],
			required: true,
		},
		period: {
			startDate: { type: Date, required: true },
			endDate: { type: Date },
			ongoing: { type: Boolean, default: false },
		},
		description: String,
		technologiesUsed: [String],
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

module.exports = mongoose.model("Experience", experienceSchema);
