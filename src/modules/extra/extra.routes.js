const express = require("express");
const router = express.Router();
const ExtraController = require("./extra.controller");
const validateExtraType = require("./extra.middleware");


// Apply type validation to all routes
router.use("/:type", validateExtraType);

// Routes
router.post("/:type", ExtraController.create);
router.get("/:type", ExtraController.getAll);
router.put("/:type/:id", ExtraController.update);
router.delete("/:type/:id", ExtraController.remove);

module.exports = router;
