const express = require("express");
const router = express.Router();
const ExtraController = require("./extra.controller");
const validateExtraType = require("./extra.middleware");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

// Apply middlewares to all routes that have :type
router.use("/:type", validateExtraType);
router.use("/:type", validateAuthenticationToken);

// Routes
router.post("/:type", ExtraController.create);
router.get("/:type", ExtraController.getAll);
router.put("/:type/:_id", ExtraController.update);
router.delete("/:type/:_id", ExtraController.remove);

module.exports = router;
