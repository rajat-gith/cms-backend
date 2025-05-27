const express = require("express");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const SkillController = require("./skill.controller");

const router = express.Router();

router.post("/", validateAuthenticationToken, SkillController.addSkill);
router.get("/", validateAuthenticationToken, SkillController.getSkills);
router.put("/:id", validateAuthenticationToken, SkillController.updateSkill);
router.delete("/:id", validateAuthenticationToken, SkillController.deleteSkill);

module.exports = router;
