const express = require("express");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const SocialProfileController = require("./socialProfile.controller");

const router = express.Router();

router.get(
	"/",
	validateAuthenticationToken,
	SocialProfileController.getProfile
);
router.post(
	"/",
	validateAuthenticationToken,
	SocialProfileController.upsertProfile
);

module.exports = router;
