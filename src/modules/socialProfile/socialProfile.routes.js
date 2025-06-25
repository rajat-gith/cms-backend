const express = require("express");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const SocialProfileController = require("./socialProfile.controller");

const router = express.Router();

router.post(
    "/",
    validateAuthenticationToken,
    SocialProfileController.createProfile
);
router.put(
    "/:id",
    validateAuthenticationToken,
    SocialProfileController.updateProfile
);
router.get(
    "/",
    validateAuthenticationToken,
    SocialProfileController.getProfile
);
router.delete(
    "/:id",
    validateAuthenticationToken,
    SocialProfileController.deleteProfile
);

module.exports = router;
