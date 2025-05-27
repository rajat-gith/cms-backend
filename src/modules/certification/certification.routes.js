// src/modules/certification/certification.routes.js
const express = require("express");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const CertificationController = require("./certification.controller");

const router = express.Router();

router.post("/", validateAuthenticationToken, CertificationController.add);
router.get("/", validateAuthenticationToken, CertificationController.getAll);
router.get(
	"/:id",
	validateAuthenticationToken,
	CertificationController.getById
);
router.put("/:id", validateAuthenticationToken, CertificationController.update);
router.delete(
	"/:id",
	validateAuthenticationToken,
	CertificationController.delete
);

module.exports = router;
