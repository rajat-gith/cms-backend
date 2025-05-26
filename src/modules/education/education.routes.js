const express = require("express");

const EducationController = require("./education.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

const router = express.Router();
router.post("/", validateAuthenticationToken, EducationController.addEducation);
router.get("/", validateAuthenticationToken, EducationController.getEducations);
router.put(
	"/:id",
	validateAuthenticationToken,
	EducationController.updateEducation
);

module.exports = router;
