const mongoose = require("mongoose");

// Shared Fields
const withUserId = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
};

const baseOptions = { timestamps: true };

// Award Honor Schema
const awardHonorSchema = new mongoose.Schema(
    {
        ...withUserId,
        title: { type: String, required: true },
        issuer: String,
        dateReceived: Date,
        description: String,
        certificateLink: String,
        category: String,
        location: String,
    },
    baseOptions
);

// Interest Schema
const interestSchema = new mongoose.Schema(
    {
        ...withUserId,
        title: { type: String, required: true },
        description: String,
        category: String,
        icon: String,
    },
    baseOptions
);

// Language Schema
const languageSchema = new mongoose.Schema(
    {
        ...withUserId,
        name: { type: String, required: true },
        proficiency: {
            type: String,
            enum: ["Basic", "Conversational", "Fluent", "Native"],
            default: "Basic",
        },
        certification: String,
    },
    baseOptions
);

// Volunteering Schema
const volunteeringSchema = new mongoose.Schema(
    {
        ...withUserId,
        role: { type: String, required: true },
        organization: { type: String, required: true },
        cause: String,
        period: {
            startDate: Date,
            endDate: Date,
            isOngoing: { type: Boolean, default: false },
        },
        description: String,
        location: String,
        website: String,
    },
    baseOptions
);

// Extracurricular Schema
const extracurricularSchema = new mongoose.Schema(
    {
        ...withUserId,
        title: { type: String, required: true },
        organization: String,
        position: String,
        period: {
            startDate: Date,
            endDate: Date,
            isOngoing: { type: Boolean, default: false },
        },
        description: String,
        location: String,
    },
    baseOptions
);

module.exports = {
    AwardHonor: mongoose.model("AwardHonor", awardHonorSchema),
    Interest: mongoose.model("Interest", interestSchema),
    Language: mongoose.model("Language", languageSchema),
    Volunteering: mongoose.model("Volunteering", volunteeringSchema),
    Extracurricular: mongoose.model("Extracurricular", extracurricularSchema),
};
