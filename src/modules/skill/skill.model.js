const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		level: {
			type: String,
			enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
			required: true,
		},
		category: String,
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
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

module.exports = mongoose.model("Skill", skillSchema);
