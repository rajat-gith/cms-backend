const mongoose = require("mongoose");
const {
	passwordComparisonMethod,
	passwordHashingMiddleware,
} = require("./user.middleware");

const UserSchema = new mongoose.Schema(
	{
		first_name: String,
		middle_name: String,
		last_name: String,
		username: { type: String, unique: true },
		linkedinURL: String,
		githubURL: String,
		otherLinks: [
			{
				platform: { type: String, required: true },
				url: { type: String, required: true },
			},
		],
		apiCredentials: [{ apiKey: String, apiSecret: String }],
		isProfileComplete: { type: Boolean, default: false },
		about: String,
		profilePhoto: String,
		email: { type: String, unique: true, required: true },
		password: { type: String },
		googleId: { type: String },
		location: {
			country: { type: String },
			state: { type: String },
			city: { type: String },
		},
		phone: String,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "admin",
		},
	},
	{
		timestamps: true,
	}
);
passwordHashingMiddleware(UserSchema);
passwordComparisonMethod(UserSchema);

module.exports = mongoose.model("User", UserSchema);
