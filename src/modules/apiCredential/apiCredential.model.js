const mongoose = require("mongoose");

const ApiCredentialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    apiKey: { type: String, required: true, unique: true, index: true },
    apiSecretHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiCredential", ApiCredentialSchema);
