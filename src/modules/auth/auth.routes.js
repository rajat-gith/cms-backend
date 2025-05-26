const express = require("express");
const AuthController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.middleware");

const router = express.Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.get("/google", AuthController.googleAuthCallback);

module.exports = router;
