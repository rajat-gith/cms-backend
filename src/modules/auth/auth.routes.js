const express = require("express");
const AuthController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.middleware");

const router = express.Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/google", AuthController.googleAuthCallback);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOtp);

module.exports = router;
