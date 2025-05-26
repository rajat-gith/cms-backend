const express = require("express");
const router = express.Router();
const ProjectController = require("./project.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

router.post("/", validateAuthenticationToken, ProjectController.addProject);
router.get("/", validateAuthenticationToken, ProjectController.getProjects);
router.put(
	"/:id",
	validateAuthenticationToken,
	ProjectController.updateProject
);
router.delete(
	"/:id",
	validateAuthenticationToken,
	ProjectController.deleteProject
);

module.exports = router;
