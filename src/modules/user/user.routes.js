const express = require("express");
const UserController = require("./user.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/profile", validateAuthenticationToken, UserController.getProfile);
router.put("/profile", validateAuthenticationToken, UserController.updateProfile);
router.post(
	"/link-google",
	validateAuthenticationToken,
	UserController.linkGoogleAccount
);
router.post(
	"/unlink-google",
	validateAuthenticationToken,
	UserController.unlinkGoogleAccount
);

module.exports = router;
