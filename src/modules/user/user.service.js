const bcrypt = require("bcryptjs");
const db = require("../../db/index");
const userQueries = require("./user.queries");

class UserService {
	static async findUserById(_id) {
		try {
			if (!_id) throw new Error("User _id is required to find a user.");
			const result = await db.query(userQueries._findUserById(), [_id]);
			return this.transformUserFromDb(result.rows[0]) || null;
		} catch (error) {
			throw new Error(`Error finding user by _id: ${error.message}`);
		}
	}

	static async findUserByEmail(email) {
		try {
			if (!email) throw new Error("Email is required to find a user.");
			const result = await db.query(userQueries._findUserByEmail(), [
				email,
			]);
			return this.transformUserFromDb(result.rows[0]) || null;
		} catch (error) {
			throw new Error(`Error finding user by email: ${error.message}`);
		}
	}

	static async findUserByGoogleId(googleId) {
		try {
			if (!googleId) throw new Error("Google _id is required.");
			const result = await db.query(userQueries._findUserByGoogleId(), [
				googleId,
			]);
			return this.transformUserFromDb(result.rows[0]) || null;
		} catch (error) {
			throw new Error(
				`Error finding user by Google _id: ${error.message}`
			);
		}
	}

	static async createUser(userData) {
		try {
			const {
				first_name = null,
				middle_name = null,
				last_name = null,
				username = null,
				linkedinURL = null,
				githubURL = null,
				otherLinks = [],
				about = null,
				profilePhoto = null,
				email = null,
				googleId = null,
				location = {},
				phone = null,
				role = "admin",
			} = userData;

			const values = [
				first_name,
				middle_name,
				last_name,
				username,
				linkedinURL,
				githubURL,
				JSON.stringify(otherLinks),
				about,
				profilePhoto,
				email,
				googleId,
				JSON.stringify(location),
				phone,
				role,
			];

			const result = await db.query(userQueries._createUser(), values);
			return this.transformUserFromDb(result.rows[0]);
		} catch (error) {
			throw new Error(`Error creating user: ${error.message}`);
		}
	}

	static async updateUser(currentUser, updateData) {
		try {
			const userId = currentUser._id;

			const {
				first_name = null,
				middle_name = null,
				last_name = null,
				username = null,
				linkedinURL = null,
				githubURL = null,
				otherLinks = null,
				about = null,
				profilePhoto = null,
				location = null,
				phone = null,
				googleId = undefined,
			} = updateData;

			const values = [
				first_name,
				middle_name,
				last_name,
				username,
				linkedinURL,
				githubURL,
				otherLinks ? JSON.stringify(otherLinks) : null,
				about,
				profilePhoto,
				location ? JSON.stringify(location) : null,
				phone,
				googleId,
				googleId,
				userId,
			];

			const result = await db.query(userQueries._updateUser(), values);
			return this.transformUserFromDb(result.rows[0]);
		} catch (error) {
			throw new Error(`Error updating user: ${error.message}`);
		}
	}

	static async updateGoogleAccount(userId, googleId, profilePicture = null) {
		try {
			const result = await db.query(userQueries._updateGoogleAccount(), [
				googleId,
				profilePicture,
				userId,
			]);

			return this.transformUserFromDb(result.rows[0]);
		} catch (error) {
			throw new Error(`Error updating Google account: ${error.message}`);
		}
	}

	static async unlinkGoogleAccount(userId) {
		try {
			const result = await db.query(userQueries._unlinkGoogleAccount(), [
				userId,
			]);
			return this.transformUserFromDb(result.rows[0]);
		} catch (error) {
			throw new Error(`Error unlinking Google account: ${error.message}`);
		}
	}

	static async checkUserPassword(userId) {
		try {
			const result = await db.query(userQueries._checkUserPassword(), [
				userId,
			]);
			return result.rows[0]?.has_password || false;
		} catch (error) {
			throw new Error(`Error checking user password: ${error.message}`);
		}
	}

	static transformUserFromDb(user) {
		if (!user) return null;

		let otherLinks = [];
		let location = {};

		try {
			otherLinks =
				typeof user.other_links === "string"
					? JSON.parse(user.other_links)
					: user.other_links || [];
		} catch (_) {}

		try {
			location =
				typeof user.location === "string"
					? JSON.parse(user.location)
					: user.location || {};
		} catch (_) {}

		return {
			_id: user._id,
			first_name: user.first_name,
			middle_name: user.middle_name,
			last_name: user.last_name,
			username: user.username,
			linkedinURL: user.linkedin_url,
			githubURL: user.github_url,
			otherLinks,
			isProfileComplete: user.is_profile_complete,
			about: user.about,
			profilePhoto: user.profile_photo,
			email: user.email,
			googleId: user.google_id,
			location,
			phone: user.phone,
			role: user.role,
		};
	}
}

module.exports = UserService;
