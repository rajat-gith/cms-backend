const express = require("express");
const CertificationController = require("./certification.controller");
const router = express.Router();

const { validateAuthenticationToken } = require("../auth/auth.middleware");

router.use(validateAuthenticationToken);
router.post("/", CertificationController.add);
router.get("/", CertificationController.getAll);
router.get("/search", CertificationController.search);
router.get("/expired", CertificationController.getExpired);
router.get("/active", CertificationController.getActive);
router.get("/category/:category", CertificationController.getByCategory);
router.get("/:id", CertificationController.getById);
router.put("/:id", CertificationController.update);
router.delete("/:id", CertificationController.delete);

module.exports = router;
