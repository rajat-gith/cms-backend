const ApiCredential = require("./apiCredential.model");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const MAX_API_KEYS = 2; // Maximum allowed API keys per user

const ApiCredentialController = {
    // Create a new credential
    async create(req, res) {
        try {
            const { userId } = req.user; // Assume user is injected by auth middleware

            // Check if user already has maximum number of API keys
            const existingCount = await ApiCredential.countDocuments({
                user: userId,
                isActive: true,
            });

            if (existingCount >= MAX_API_KEYS) {
                return res.status(400).json({
                    message: `Maximum of ${MAX_API_KEYS} API keys allowed per user`,
                });
            }

            const rawSecret = uuidv4();
            const apiKey = uuidv4();
            const apiSecretHash = await bcrypt.hash(rawSecret, 10);

            const credential = await ApiCredential.create({
                user: userId,
                apiKey,
                apiSecretHash,
                isActive: true,
            });

            // Return the structure that matches your frontend expectations
            res.status(201).json({
                message: "API Key created",
                _id: credential._id,
                apiKey: credential.apiKey,
                rawSecret, // Only return once!
                credential: {
                    _id: credential._id,
                    apiKey: credential.apiKey,
                    apiSecret: "", // Don't expose the hash
                    user: credential.user,
                    isActive: credential.isActive,
                    createdAt: credential.createdAt,
                    updatedAt: credential.updatedAt,
                },
            });
        } catch (err) {
            console.error("Error creating API key:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all credentials for a user
    async getAll(req, res) {
        try {
            const { userId } = req.user;
            const creds = await ApiCredential.find({ user: userId }).select(
                "-apiSecretHash"
            );

            // Transform the response to match frontend expectations
            const transformedCreds = creds.map((cred) => ({
                _id: cred._id,
                apiKey: cred.apiKey,
                apiSecret: "", // Never expose the actual secret
                user: cred.user,
                isActive: cred.isActive,
                createdAt: cred.createdAt,
                updatedAt: cred.updatedAt,
            }));

            res.json({ credentials: transformedCreds });
        } catch (err) {
            console.error("Error fetching credentials:", err);
            res.status(500).json({ message: "Failed to fetch credentials" });
        }
    },

    // Delete a specific credential
    async remove(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.user;

            // Make sure user can only delete their own credentials
            const deleted = await ApiCredential.findOneAndDelete({
                _id: id,
                user: userId,
            });

            if (!deleted) {
                return res
                    .status(404)
                    .json({ message: "Credential not found" });
            }

            res.json({
                message: "API key deleted",
                deletedId: id,
            });
        } catch (err) {
            console.error("Error deleting API key:", err);
            res.status(500).json({ message: "Error deleting API key" });
        }
    },

    // Toggle isActive flag
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const { userId } = req.user;

            const credential = await ApiCredential.findOne({
                _id: id,
                user: userId,
            });

            if (!credential) {
                return res
                    .status(404)
                    .json({ message: "Credential not found" });
            }

            credential.isActive = !credential.isActive;
            await credential.save();

            res.json({
                message: "Updated status",
                isActive: credential.isActive,
                credential: {
                    _id: credential._id,
                    apiKey: credential.apiKey,
                    apiSecret: "",
                    user: credential.user,
                    isActive: credential.isActive,
                    createdAt: credential.createdAt,
                    updatedAt: credential.updatedAt,
                },
            });
        } catch (err) {
            console.error("Error toggling active status:", err);
            res.status(500).json({ message: "Error toggling active status" });
        }
    },
};

module.exports = ApiCredentialController;
