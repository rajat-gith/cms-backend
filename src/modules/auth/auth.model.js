const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String},
});

module.exports = mongoose.model("Auth", authSchema);
