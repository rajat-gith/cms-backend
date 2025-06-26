const ExtraService = require("./extra.service");

const ExtraController = {
    async create(req, res) {
        try {
            const userId = req.user.userId;
            const type = req.params.type;
            const result = await ExtraService.create(type, userId, req.body);
            res.status(201).json(
                json({
                    message: `${type} added`,
                    data: result,
                })
            );
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async getAll(req, res) {
        try {
            const userId = req.user.userId;
            const type = req.params.type;
            const result = await ExtraService.getAll(type, userId);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
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
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async remove(req, res) {
        try {
            const userId = req.user.userId;
            const type = req.params.type;
            const id = req.params.id;
            const result = await ExtraService.remove(type, id, userId);
            res.status(200).json({ message: "Deleted successfully", result });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};

module.exports = ExtraController;
