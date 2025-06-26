const express = require("express");
const apiKeyAuthFromQuery = require("../apiCredential/apiKeyauth.middleware");
const PublicController = require("./public.controller");

const router = express.Router();

router.get("/:entity", apiKeyAuthFromQuery, PublicController.getEntityData);
router.get(
    "/:module/:entity",
    apiKeyAuthFromQuery,
    PublicController.getEntityData
);

router.get("/", (req, res) => {
    res.status(400).json({
        message:
            "Missing entity. Use /public/:entity or /public/:module/:entity",
    });
});

module.exports = router;
