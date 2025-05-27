const express = require("express");
const { validateAuthenticationToken } = require("../auth/auth.middleware");
const BlogController = require("./blog.controller");

const router = express.Router();

router.post("/", validateAuthenticationToken, BlogController.createBlog);
router.get("/", validateAuthenticationToken, BlogController.getBlogs);
router.get("/:id", validateAuthenticationToken, BlogController.getBlogById);
router.put("/:id", validateAuthenticationToken, BlogController.updateBlog);

module.exports = router;
