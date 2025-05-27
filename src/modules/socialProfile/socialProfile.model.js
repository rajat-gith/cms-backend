// src/modules/socialProfile/socialProfile.model.js
const mongoose = require("mongoose");

const socialSubSchema = {
	url: { type: String },
	username: { type: String },
};

const socialProfileSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isPublic: { type: Boolean, default: true },
		socials: {
			email: { type: String },
			phone: { type: String },
			linkedin: socialSubSchema,
			twitter: socialSubSchema,
			github: socialSubSchema,
			website: socialSubSchema,
			youtube: socialSubSchema,
			instagram: socialSubSchema,
			facebook: socialSubSchema,
			medium: socialSubSchema,
			devto: socialSubSchema,
			other: {
				platform: { type: String },
				url: { type: String },
				username: { type: String },
			},
		},
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("SocialProfile", socialProfileSchema);
