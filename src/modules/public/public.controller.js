const path = require("path");

const PublicController = {
    async getEntityData(req, res) {
        const entity = req.params.entity?.toLowerCase();
        const { user } = req;

        if (!entity) {
            return res.status(400).json({ message: "Entity not provided" });
        }

        const functionName = `get${entity
            .charAt(0)
            .toUpperCase()}${entity.slice(1)}sByUser`;

        let servicePath;
        try {
            // Build dynamic path to service file
            servicePath = path.join(
                __dirname,
                "..",
                entity,
                `${entity}.service.js`
            );
            const serviceModule = require(servicePath);

            const serviceFunction = serviceModule[functionName];
            if (typeof serviceFunction !== "function") {
                return res
                    .status(400)
                    .json({
                        message: `Function ${functionName} not found in ${entity}.service.js`,
                    });
            }

            // Call service function with userId
            const data = await serviceFunction(user._id);
            return res.json({ data });
        } catch (err) {
            console.error(
                `❌ Error loading service from ${servicePath}:`,
                err.message
            );
            return res
                .status(500)
                .json({ message: `Failed to fetch ${entity} data` });
        }
    },
};

module.exports = PublicController;
