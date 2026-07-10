const express = require("express");
const router = express.Router();
const AiCopilotController = require("./aiCopilot.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const apiKeyAuth = require("../apiCredential/apiKeyauth.middleware");
const publicRateLimit = require("../public/publicRateLimit.middleware");

// Owner-only: dashboard needs to know when data was last ingested and
// whether a new sync is allowed right now.
router.get(
	"/status",
	validateAuthenticationToken,
	AiCopilotController.getStatus,
);

// Owner-only: triggers re-ingestion, rate-limited server-side.
router.post("/sync", apiKeyAuth, AiCopilotController.sync);

// Public: portfolio visitors ask questions about the profile. No auth.
router.post("/ask", apiKeyAuth, publicRateLimit, AiCopilotController.ask);

module.exports = router;
