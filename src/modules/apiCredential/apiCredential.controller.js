const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const ApiCredentialService = require("./apiCredential.service");

const MAX_API_KEYS = 2;

const ApiCredentialController = {
	async create(req, res) {
		try {
			const { id: userId } = req.user;

			const activeCount = await ApiCredentialService.countActiveByUser(
				userId
			);
			if (activeCount >= MAX_API_KEYS) {
				return res.status(400).json({
					message: `Maximum of ${MAX_API_KEYS} API keys allowed per user`,
				});
			}

			const apiKey = uuidv4();
			const rawSecret = uuidv4();
			const apiSecretHash = await bcrypt.hash(rawSecret, 10);

			const credential = await ApiCredentialService.createCredential(
				userId,
				apiKey,
				apiSecretHash
			);

			res.status(201).json({
				message: "API Key created",
				_id: credential.id,
				apiKey: credential.api_key,
				rawSecret,
				credential: {
					_id: credential.id,
					apiKey: credential.api_key,
					apiSecret: "",
					user: credential.user_id,
					isActive: credential.is_active,
					createdAt: credential.created_at,
					updatedAt: credential.updated_at,
				},
			});
		} catch (err) {
			console.error("Error creating API credential:", err);
			res.status(500).json({ message: "Internal server error" });
		}
	},

	// Fetch all credentials for a user
	async getAll(req, res) {
		try {
			const { id: userId } = req.user;
			const creds = await ApiCredentialService.getCredentialsByUser(
				userId
			);

			const response = creds.map((cred) => ({
				_id: cred.id,
				apiKey: cred.api_key,
				apiSecret: "",
				user: cred.user_id,
				isActive: cred.is_active,
				createdAt: cred.created_at,
				updatedAt: cred.updated_at,
			}));

			res.json({ credentials: response });
		} catch (err) {
			console.error("Error fetching credentials:", err);
			res.status(500).json({ message: "Failed to fetch credentials" });
		}
	},

	// Delete a credential
	async remove(req, res) {
		try {
			const { id } = req.params;
			const { id: userId } = req.user;

			const deleted = await ApiCredentialService.deleteCredential(
				id,
				userId
			);
			if (!deleted) {
				return res
					.status(404)
					.json({ message: "Credential not found or unauthorized" });
			}

			res.json({
				message: "API key deleted",
				deletedId: deleted.id,
			});
		} catch (err) {
			console.error("Error deleting API key:", err);
			res.status(500).json({ message: "Error deleting API key" });
		}
	},

	// Toggle active status
	async toggleActive(req, res) {
		try {
			const { id } = req.params;
			const { id: userId } = req.user;

			const updated = await ApiCredentialService.toggleCredential(
				id,
				userId
			);
			if (!updated) {
				return res
					.status(404)
					.json({ message: "Credential not found or unauthorized" });
			}

			res.json({
				message: "Updated status",
				isActive: updated.is_active,
				credential: {
					_id: updated.id,
					apiKey: updated.api_key,
					apiSecret: "",
					user: updated.user_id,
					isActive: updated.is_active,
					createdAt: updated.created_at,
					updatedAt: updated.updated_at,
				},
			});
		} catch (err) {
			console.error("Error toggling credential:", err);
			res.status(500).json({ message: "Error toggling active status" });
		}
	},
};

module.exports = ApiCredentialController;
