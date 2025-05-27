const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: { type: String, required: true },
		proficiency: {
			type: String,
			enum: ["Basic", "Conversational", "Fluent", "Native"],
			default: "Basic",
		},
		certification: String,
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

module.exports = mongoose.model("Language", languageSchema);
