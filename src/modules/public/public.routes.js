const express = require("express");
const apiKeyAuthFromQuery = require("../apiCredential/apiKeyauth.middleware");
const PublicController = require("./public.controller");

const router = express.Router();

// Match /public/:entity
router.get("/:entity", apiKeyAuthFromQuery, PublicController.getEntityData);

// Optional: handle just /public with a help message
router.get("/", (req, res) => {
  res.status(400).json({ message: "Missing entity. Use /public/:entity" });
});

module.exports = router;
