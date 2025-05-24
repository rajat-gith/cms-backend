const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: String,
    middle_name: String,
    last_name: String,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },

    linkedinURL: String,
    githubURL: String,
    otherLinks: [
      {
        platform: { type: String, required: true }, 
        url: { type: String, required: true },
      },
    ],

    about: String,
    profilePhoto: String,

    location: String,
    phone: String,
    skills: [String],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
