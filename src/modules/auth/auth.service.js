const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const { OAuth2Client } = require("google-auth-library");
const db = require("../../db/index");
const redis = require("./redis/redis.client");
const otpService = require("./otp/otp.service");
const { sendOTPMessage } = require("./email/email.producer");
const UserService = require("../user/user.service");
const queries = require("./auth.queries");

const oAuth2Client = new OAuth2Client(
	config.google.clientId,
	config.google.clientSecret,
	config.google.redirectUri
);

class AuthService {
	// Step 1: Send OTP to email
	static async initiateRegistration(email, password) {
		const { rows: existingRows } = await db.query(queries._findByEmail(), [
			email,
		]);
		if (existingRows[0])
			throw new Error("User with this email already exists.");

		const otp = otpService.generateOTP();
		await redis.setex(`otp:${email}`, 300, otp); // 5 min expiry
		await redis.set(`password:${email}`, password, { ex: 600 }); // 10 min expiry

		await sendOTPMessage(email, otp);
	}

	// Step 2: Verify OTP and register user
	static async verifyEmailOTP(email, otp) {
		const cachedOtp = await redis.get(`otp:${email}`);

		if (!cachedOtp || String(cachedOtp) !== otp)
			throw new Error("Invalid or expired OTP");

		console.log("OTP verified successfully");
		const password = await redis.get(`password:${email}`);
		if (!password) throw new Error("Password expired or missing");

		const name = email.split("@")[0];
		const username = name;

		const user = await UserService.createUser({ email, name, username });
		const passwordHash = await bcrypt.hash(String(password), 10);

		await db.query(queries._createAuth(), [
			user._id,
			email,
			passwordHash,
			null,
			null,
		]);

		await redis.del(`otp:${email}`);
		await redis.del(`password:${email}`);

		return this.generateAuthToken(user, "email");
	}

	static async resendOTP(email) {
		const resendKey = `otp_resend:${email}`;
		const otpKey = `otp:${email}`;

		const canResend = await redis.get(resendKey);
		if (canResend) {
			throw new Error(
				"OTP already sent. Please wait before requesting again."
			);
		}

		const otp = otpService.generateOTP();

		await redis.setex(otpKey, 300, otp);
		await redis.setex(resendKey, 60, "sent");

		await sendOTPMessage(email, otp);
	}

	// Login
	static async loginUser(email, password) {
		const { rows } = await db.query(queries._findByEmail(), [email]);
		const auth = rows[0];

		if (!auth || !auth.password) throw new Error("Invalid credentials");

		const isMatch = await bcrypt.compare(password, auth.password);
		if (!isMatch) throw new Error("Invalid credentials");

		const user = await UserService.findUserById(auth.user_id);
		return this.generateAuthToken(user, "email");
	}

	// Google OAuth
	static async handleGoogleAuth(authCode) {
		const { tokens } = await oAuth2Client.getToken(authCode);
		if (!tokens.id_token)
			throw new Error("Invalid token response from Google");

		const ticket = await oAuth2Client.verifyIdToken({
			idToken: tokens.id_token,
			audience: config.google.clientId,
		});

		const payload = ticket.getPayload();
		if (!payload.email_verified)
			throw new Error("Google email not verified");

		const {
			sub: googleId,
			email,
			name = "User",
			picture: profilePicture,
		} = payload;

		const { rows: existingGoogle } = await db.query(
			queries._findByGoogleId(),
			[googleId]
		);

		let user;

		if (!existingGoogle[0]) {
			const { rows: existingEmailRows } = await db.query(
				queries._findByEmail(),
				[email]
			);
			const existing = existingEmailRows[0];

			if (existing) {
				if (existing.google_id && existing.google_id !== googleId) {
					throw new Error(
						"Email already linked to different Google account"
					);
				}

				await db.query(queries._updateAuth(), [
					googleId,
					profilePicture,
					existing._id,
				]);
				user = await UserService.getUserById(existing.user_id);
			} else {
				user = await UserService.createUser({ email, name });

				await db.query(queries._createAuth(), [
					user._id,
					email,
					null,
					googleId,
					profilePicture,
				]);
			}
		} else {
			const auth = existingGoogle[0];
			user = await UserService.getUserById(auth.user_id);
		}

		return this.generateAuthToken(user, "google");
	}

	// Token generator
	static generateAuthToken(user, method = "email") {
		const { password, ...userSafe } = user;
		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
				authMethod: method,
			},
			config.jwt.secret,
			{ expiresIn: config.jwt.expiresIn }
		);

		return { user: userSafe, token, authMethod: method };
	}
}

module.exports = AuthService;
