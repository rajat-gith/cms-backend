const express = require("express");
const HealthController = require("./health.controller");

const router = express.Router();

router.get("/", HealthController.getHealth);
router.get("/liveness", HealthController.getLiveness);
router.get("/readiness", HealthController.getReadiness);

module.exports = router;
