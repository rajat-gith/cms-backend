const express = require("express");
const ExtraController = require("./extra.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const validateExtraType = require("./extra.middleware");

const router = express.Router();
router.use("/:type", validateExtraType);

router.post("/:type", validateAuthenticationToken, ExtraController.create);
router.get("/:type", validateAuthenticationToken, ExtraController.getAll);
router.put("/:type/:id", validateAuthenticationToken, ExtraController.update);
router.delete(
    "/:type/:id",
    validateAuthenticationToken,
    ExtraController.remove
);

module.exports = router;
