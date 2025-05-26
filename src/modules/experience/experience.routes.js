const express = require("express");
const ExperienceController = require("./experience.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

const router = express.Router();

router.post(
	"/",
	validateAuthenticationToken,
	ExperienceController.addExperience
);
router.get(
	"/",
	validateAuthenticationToken,
	ExperienceController.getExperiences
);
router.put(
	"/:id",
	validateAuthenticationToken,
	ExperienceController.updateExperience
);
router.delete(
	"/:id",
	validateAuthenticationToken,
	ExperienceController.deleteExperience
);

module.exports = router;
