// blog.model.js - Enhanced with concurrency fields
const mongoose = require("mongoose");
const { STATES } = require("./blog.fsm");

const blogSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		tags: [String],
		author: {
			name: String,
			userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		},
		collaborators: [
			{
				userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				role: {
					type: String,
					enum: ["editor", "viewer"],
					default: "viewer",
				},
			},
		],
		isPublished: { type: Boolean, default: false },
		publishedAt: Date,
		updatedAt: { type: Date, default: Date.now },
		version: { type: Number, default: 1 }, // Optimistic locking
		state: {
			type: String,
			enum: Object.values(STATES),
			default: STATES.DRAFT,
		},
		// Concurrency control fields
		lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		lockedAt: { type: Date },
		lockExpiresAt: { type: Date },
		lockReason: { type: String }, // editing, reviewing, etc.
		lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		conflictResolution: {
			strategy: {
				type: String,
				enum: ["last_writer_wins", "manual_merge", "version_branch"],
				default: "manual_merge",
			},
		},
		// Change tracking
		changeHistory: [
			{
				userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				action: String,
				timestamp: { type: Date, default: Date.now },
				oldState: String,
				newState: String,
				changes: mongoose.Schema.Types.Mixed,
			},
		],
	},
	{ timestamps: true }
);

// Index for efficient lock queries
blogSchema.index({ lockedBy: 1, lockExpiresAt: 1 });
blogSchema.index({ "author.userId": 1, "collaborators.userId": 1 });

// Middleware to handle version increment
blogSchema.pre("save", function (next) {
	if (this.isModified() && !this.isNew) {
		this.version += 1;
		this.updatedAt = new Date();
	}
	next();
});

module.exports = mongoose.model("Blog", blogSchema);
