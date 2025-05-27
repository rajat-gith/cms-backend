const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
	name: { type: String, required: true },
	linkedinURL: { type: String },
	twitterURL: { type: String },
	otherLinks: [
		{
			platform: { type: String },
			url: { type: String },
		},
	],
});

const projectSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		description: String,
		technologies: [String],
		role: String,
		teamSize: Number,

		projectType: {
			type: String,
			enum: ["individual", "group"],
			default: "individual",
		},

		teamMembers: [teamMemberSchema],
		otherLinks: String,
		repositoryLink: String,
		liveDemoLink: String,
		achievements: [String],

		duration: {
			startDate: { type: Date, required: true },
			endDate: Date,
			isOngoing: { type: Boolean, default: false },
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

module.exports = mongoose.model("Project", projectSchema);
