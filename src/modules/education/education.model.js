const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
	{
		courseName: { type: String, required: true },
		institute: { type: String, required: true },
		periodOfCourse: {
			startDate: { type: Date, required: true },
			endDate: { type: Date },
			isOngoing: { type: Boolean, default: false },
		},
		skills: {
			type: [String],
		},
		courseworks: {
			type: [String],
		},
		grades: {
			type: {
				type: String,
				enum: ["cgpa", "percentage"],
				required: true,
			},
			value: {
				type: Number,
				required: true,
			},
		},
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
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Education", educationSchema);
