const allowedTypes = [
	"award-honor",
	"interest",
	"language",
	"volunteering",
	"extracurricular",
];

function validateExtraType(req, res, next) {
	const type = req.params.type;

	if (!type) {
		return res.status(400).json({
			error: "Type parameter is required",
		});
	}

	if (!allowedTypes.includes(type)) {
		return res.status(400).json({
			error: `Invalid type in route. Allowed types: ${allowedTypes.join(
				", "
			)}`,
		});
	}

	next();
}

module.exports = validateExtraType;
