const express = require("express");
const router = express.Router();
const SocialProfileController = require("./socialProfile.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
router.use(validateAuthenticationToken);

router.post("/", SocialProfileController.createProfile);
router.get("/my-profiles", SocialProfileController.getProfile);
router.get("/public", SocialProfileController.getPublicProfiles);
router.get("/:id", SocialProfileController.getProfileById);
router.get("/user/:userId", SocialProfileController.getProfilesByUserId);
router.put("/:id", SocialProfileController.updateProfile);
router.delete("/:id", SocialProfileController.deleteProfile);

module.exports = router;
