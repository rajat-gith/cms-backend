const path = require("path");

const PublicController = {
	async getEntityData(req, res) {
		const { module, entity } = req.params;
		const key = module ? `${module}/${entity}` : entity;
		const { user } = req;

		if (!entity) {
			return res.status(400).json({ message: "Entity not provided" });
		}

		let servicePath;
        console.log(entity)
		try {
			if (entity === "profile") {
				const userService = require(path.join(
					__dirname,
					"..",
					"user",
					"user.service.js"
				));

				const data = await userService.findUserById(user._id);

				return res.json({ data });
			}

			// Construct service path
			servicePath = path.join(
				__dirname,
				"..",
				module || entity,
				`${module || entity}.service.js`
			);

			const serviceModule = require(servicePath);

			let functionName;

			if (module) {
				const singular = entity.endsWith("s")
					? entity.slice(0, -1).charAt(0).toUpperCase() +
					  entity.slice(1, -1)
					: entity.charAt(0).toUpperCase() + entity.slice(1);

				functionName = `get${singular}sByUser`;
			} else {
				functionName = `get${entity
					.charAt(0)
					.toUpperCase()}${entity.slice(1)}sByUser`;
			}

			const serviceFunction = serviceModule[functionName];

			if (typeof serviceFunction !== "function") {
				return res.status(400).json({
					message: `Function ${functionName} not found in ${
						module || entity
					}.service.js`,
				});
			}

			const data = await serviceFunction(user._id);
			return res.json({ data });
		} catch (err) {
			console.error(
				`❌ Error loading service from ${servicePath}:`,
				err.message
			);
			return res.status(500).json({
				message: `Failed to fetch ${key} data`,
				error: err.message,
			});
		}
	},
};

module.exports = PublicController;
