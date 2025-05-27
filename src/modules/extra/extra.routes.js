const express = require("express");
const router = express.Router();
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const ExtraController = require("./extra.controller");

const routes = [
	{ base: "language", controller: "Language" },
	{ base: "extracurricular", controller: "Extracurricular" },
	{ base: "volunteering", controller: "Volunteering" },
	{ base: "interest", controller: "Interest" },
	{ base: "award-honor", controller: "AwardHonor" },
];

routes.forEach(({ base, controller }) => {
	const ctrl = ExtraController;

	router.post(
		`/${base}`,
		validateAuthenticationToken,
		ctrl[`add${controller}`]
	);
	router.get(
		`/${base}`,
		validateAuthenticationToken,
		ctrl[`get${controller}s`]
	);
	router.put(
		`/${base}/:id`,
		validateAuthenticationToken,
		ctrl[`update${controller}`]
	);
});

module.exports = router;
