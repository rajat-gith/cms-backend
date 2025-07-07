const express = require("express");
const ApiCredentialController = require("./apiCredential.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

const router = express.Router();


router.post("/", validateAuthenticationToken, ApiCredentialController.create);
router.get("/", validateAuthenticationToken, ApiCredentialController.getAll);
router.delete(
  "/:_id",
  validateAuthenticationToken,
  ApiCredentialController.remove
);
router.patch(
  "/:_id/toggle",
  validateAuthenticationToken,
  ApiCredentialController.toggleActive
);

module.exports = router;
