const express = require("express");
const apiKeyAuthFromQuery = require("../apiCredential/apiKeyauth.middleware");
const publicRateLimit = require("./publicRateLimit.middleware");
const PublicController = require("./public.controller");

const router = express.Router();

router.get("/:entity", apiKeyAuthFromQuery, publicRateLimit, PublicController.getEntityData);
router.get(
	"/:module/:entity",
	apiKeyAuthFromQuery,
	publicRateLimit,
	PublicController.getEntityData
);

router.get("/", (req, res) => {
	res.status(400).json({
		message: "Missing entity. Use /public/:entity or /public/:module/:entity",
	});
});

module.exports = router;    