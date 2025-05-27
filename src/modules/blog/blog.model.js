const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		tags: [String],
		author: {
			name: String,
			userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		},
		coverImage: String,
		isPublished: { type: Boolean, default: false },
		publishedAt: { type: Date },
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
