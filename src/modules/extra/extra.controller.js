const ExtraService = require("./extra.service");

const ExtraController = {
	async create(req, res) {
		try {
			const userId = req.user.userId;
			const type = req.params.type;
			const result = await ExtraService.create(type, userId, req.body);
			res.status(201).json({
				message: `${type} added successfully`,
				data: result,
			});
		} catch (err) {
			console.error("Error creating extra:", err);
			res.status(400).json({
				error: err.message || "Failed to create record",
			});
		}
	},

	async getAll(req, res) {
		try {
			const userId = req.user.userId;
			const type = req.params.type;
			const result = await ExtraService.getAll(type, userId);
			res.status(200).json({
				data: result,
				count: result.length,
			});
		} catch (err) {
			console.error("Error fetching extras:", err);
			res.status(400).json({
				error: err.message || "Failed to fetch records",
			});
		}
	},

	async update(req, res) {
		try {
			const userId = req.user.userId;
			const type = req.params.type;
			const id = req.params.id;
			const result = await ExtraService.update(
				type,
				id,
				userId,
				req.body
			);
			res.status(200).json({
				message: `${type} updated successfully`,
				data: result,
			});
		} catch (err) {
			console.error("Error updating extra:", err);
			res.status(400).json({
				error: err.message || "Failed to update record",
			});
		}
	},

	async remove(req, res) {
		try {
			const userId = req.user.userId;
			const type = req.params.type;
			const id = req.params.id;
			const result = await ExtraService.remove(type, id, userId);
			res.status(200).json({
				message: `${type} deleted successfully`,
				data: result,
			});
		} catch (err) {
			console.error("Error deleting extra:", err);
			res.status(400).json({
				error: err.message || "Failed to delete record",
			});
		}
	},
};

module.exports = ExtraController;
