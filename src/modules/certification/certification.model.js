const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		issuingOrganization: { type: String, required: true },
		issueDate: { type: Date, required: true },
		expirationDate: { type: Date },
		isExpired: { type: Boolean, default: false },
		credentialId: { type: String },
		credentialURL: { type: String },
		category: { type: String },
		skills: [String],
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

module.exports = mongoose.model("Certification", certificationSchema);
