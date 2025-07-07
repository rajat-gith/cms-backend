const express = require("express");
const router = express.Router();
const SocialProfileController = require("./socialProfile.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
router.use(validateAuthenticationToken);

router.post("/", SocialProfileController.createProfile);
router.get("/my-profiles", SocialProfileController.getProfile);
router.get("/public", SocialProfileController.getPublicProfiles);
router.get("/:_id", SocialProfileController.getProfileById);
router.get("/user/:userId", SocialProfileController.getProfilesByUserId);
router.put("/:_id", SocialProfileController.updateProfile);
router.delete("/:_id", SocialProfileController.deleteProfile);

module.exports = router;
