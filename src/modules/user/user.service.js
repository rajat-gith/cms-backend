const bcrypt = require("bcryptjs");
const db = require("../../db/index");
const userQueries = require("./user.queries");

class UserService {
	static async findUserById(id) {
		try {
			const result = await db.query(userQueries._findUserById(), [id]);
			return result.rows[0] || null;
		} catch (error) {
			throw new Error(`Error finding user by ID: ${error.message}`);
		}
	}

	static async findUserByEmail(email) {
		try {
			const result = await db.query(userQueries.findUserByEmail(), [
				email,
			]);
			return result.rows[0] || null;
		} catch (error) {
			throw new Error(`Error finding user by email: ${error.message}`);
		}
	}

	static async findUserByGoogleId(googleId) {
		try {
			const result = await db.query(userQueries.findUserByGoogleId(), [
				googleId,
			]);
			return result.rows[0] || null;
		} catch (error) {
			throw new Error(
				`Error finding user by Google ID: ${error.message}`
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

			const linkedin_url = linkedinURL;
			const github_url = githubURL;
			const other_links = JSON.stringify(otherLinks);
			const profile_photo = profilePhoto;
			const google_id = googleId;
			const locationJson = JSON.stringify(location);

			const values = [
				first_name,
				middle_name,
				last_name,
				username,
				linkedin_url,
				github_url,
				other_links,
				about,
				profile_photo,
				email,
				google_id,
				locationJson,
				phone,
				role,
			];

			const result = await db.query(userQueries._createUser(), values);
			const user = result.rows[0];
			return this.transformUserFromDb(user);
		} catch (error) {
			throw new Error(`Error creating user: ${error.message}`);
		}
	}

	static async updateUser(currentUser, updateData) {
		try {
			const userId = currentUser.id;

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

			const linkedin_url = linkedinURL;
			const github_url = githubURL;
			const other_links = otherLinks ? JSON.stringify(otherLinks) : null;
			const profile_photo = profilePhoto;
			const locationJson = location ? JSON.stringify(location) : null;
			const google_id = googleId;

			const result = await db.query(userQueries.updateUser(), [
				first_name,
				middle_name,
				last_name,
				username,
				linkedin_url,
				github_url,
				other_links,
				about,
				profile_photo,
				locationJson,
				phone,
				google_id,
				google_id,
				userId,
			]);

			const updatedUser = result.rows[0];
			return this.transformUserFromDb(updatedUser);
		} catch (error) {
			throw new Error(`Error updating user: ${error.message}`);
		}
	}

	static async updateGoogleAccount(userId, googleId, profilePicture = null) {
		try {
			const result = await db.query(userQueries.updateGoogleAccount(), [
				googleId,
				profilePicture,
				userId,
			]);

			const user = result.rows[0];
			return this.transformUserFromDb(user);
		} catch (error) {
			throw new Error(`Error updating Google account: ${error.message}`);
		}
	}

	static async unlinkGoogleAccount(userId) {
		try {
			const result = await db.query(userQueries.unlinkGoogleAccount(), [
				userId,
			]);
			const user = result.rows[0];
			return this.transformUserFromDb(user);
		} catch (error) {
			throw new Error(`Error unlinking Google account: ${error.message}`);
		}
	}

	static async checkUserPassword(userId) {
		try {
			const result = await db.query(userQueries.checkUserPassword(), [
				userId,
			]);
			return result.rows[0];
		} catch (error) {
			throw new Error(`Error checking user password: ${error.message}`);
		}
	}

	static transformUserFromDb(user) {
		if (!user) return null;

		return {
			id: user.id,
			first_name: user.first_name,
			middle_name: user.middle_name,
			last_name: user.last_name,
			username: user.username,
			linkedinURL: user.linkedin_url,
			githubURL: user.github_url,
			otherLinks: user.other_links || [],
			isProfileComplete: user.is_profile_complete,
			about: user.about,
			profilePhoto: user.profile_photo,
			email: user.email,
			googleId: user.google_id,
			location: user.location || {},
			phone: user.phone,
			role: user.role,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
			...(user.password && { password: user.password }),
		};
	}
}

module.exports = UserService;
