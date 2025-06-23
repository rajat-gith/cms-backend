const express = require("express");
const BlogController = require("./blog.controller");
const { validateAuthenticationToken } = require("../auth/auth.middleware");

const router = express.Router();

// Basic CRUD operations
router.post("/", validateAuthenticationToken, BlogController.createBlog);
router.get("/", validateAuthenticationToken, BlogController.getBlogs);
router.get("/:id", validateAuthenticationToken, BlogController.getBlogById);
router.put("/:id", validateAuthenticationToken, BlogController.updateBlog);
router.delete("/:id", validateAuthenticationToken, BlogController.deleteBlog);

// Collaboration
router.post(
	"/:id/collaborators",
	validateAuthenticationToken,
	BlogController.addCollaborator
);

// State transitions
router.post(
	"/:id/transition",
	validateAuthenticationToken,
	BlogController.transition
);

// Lock management
router.post(
	"/:id/lock",
	validateAuthenticationToken,
	BlogController.acquireLock
);
router.delete(
	"/:id/lock",
	validateAuthenticationToken,
	BlogController.releaseLock
);
router.get(
	"/:id/lock",
	validateAuthenticationToken,
	BlogController.getLockStatus
);

// Conflict resolution
router.post(
	"/:id/resolve-conflict",
	validateAuthenticationToken,
	BlogController.resolveConflict
);

module.exports = router;