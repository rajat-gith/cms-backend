const pool = require("../../db/index");
const queries = require("./socialProfile.queries");

const SocialProfileService = {
	async create(userId, data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const { isPublic = true, socials = {} } = data;

			const values = [
				userId,
				isPublic,
				socials.email || null,
				socials.phone || null,
				socials.linkedin?.url || null,
				socials.linkedin?.username || null,
				socials.twitter?.url || null,
				socials.twitter?.username || null,
				socials.github?.url || null,
				socials.github?.username || null,
				socials.website?.url || null,
				socials.website?.username || null,
				socials.youtube?.url || null,
				socials.youtube?.username || null,
				socials.instagram?.url || null,
				socials.instagram?.username || null,
				socials.facebook?.url || null,
				socials.facebook?.username || null,
				socials.medium?.url || null,
				socials.medium?.username || null,
				socials.devto?.url || null,
				socials.devto?.username || null,
				socials.other?.platform || null,
				socials.other?.url || null,
				socials.other?.username || null,
			];

			const result = await client.query(
				queries._createSocialProfile(),
				values
			);
			await client.query("COMMIT");

			return SocialProfileService.formatProfile(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	},

	async update(profileId, data) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const { isPublic, socials = {} } = data;

			const values = [
				profileId,
				isPublic,
				socials.email,
				socials.phone,
				socials.linkedin?.url,
				socials.linkedin?.username,
				socials.twitter?.url,
				socials.twitter?.username,
				socials.github?.url,
				socials.github?.username,
				socials.website?.url,
				socials.website?.username,
				socials.youtube?.url,
				socials.youtube?.username,
				socials.instagram?.url,
				socials.instagram?.username,
				socials.facebook?.url,
				socials.facebook?.username,
				socials.medium?.url,
				socials.medium?.username,
				socials.devto?.url,
				socials.devto?.username,
				socials.other?.platform,
				socials.other?.url,
				socials.other?.username,
			];

			const result = await client.query(
				queries._updateSocialProfile(),
				values
			);
			await client.query("COMMIT");

			return result.rows[0]
				? SocialProfileService.formatProfile(result.rows[0])
				: null;
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	},

	async delete(profileId) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const result = await client.query(queries._deleteSocialProfile(), [
				profileId,
			]);

			if (result.rows.length === 0) {
				throw new Error("Profile not found");
			}

			await client.query("COMMIT");
			return SocialProfileService.formatProfile(result.rows[0]);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	},

	async getSocialProfileByUser(userId) {
		const result = await pool.query(queries._getSocialProfilesByUserId(), [
			userId,
		]);
		return result.rows.map((profile) =>
			SocialProfileService.formatProfile(profile)
		);
	},

	async getById(profileId) {
		const result = await pool.query(queries._getSocialProfileById(), [
			profileId,
		]);
		return result.rows[0]
			? SocialProfileService.formatProfile(result.rows[0])
			: null;
	},

	async checkOwnership(profileId, userId) {
		const result = await pool.query(queries._checkProfileOwnership(), [
			profileId,
			userId,
		]);
		return result.rows.length > 0;
	},

	async getAllPublicProfiles() {
		const result = await pool.query(queries._getAllPublicProfiles());
		return result.rows.map((profile) =>
			SocialProfileService.formatProfile(profile)
		);
	},

	formatProfile(profile) {
		return {
			_id: profile._id,
			userId: profile.user_id,
			isPublic: profile.is_public,
			socials: {
				email: profile.email,
				phone: profile.phone,
				linkedin: {
					url: profile.linkedin_url,
					username: profile.linkedin_username,
				},
				twitter: {
					url: profile.twitter_url,
					username: profile.twitter_username,
				},
				github: {
					url: profile.github_url,
					username: profile.github_username,
				},
				website: {
					url: profile.website_url,
					username: profile.website_username,
				},
				youtube: {
					url: profile.youtube_url,
					username: profile.youtube_username,
				},
				instagram: {
					url: profile.instagram_url,
					username: profile.instagram_username,
				},
				facebook: {
					url: profile.facebook_url,
					username: profile.facebook_username,
				},
				medium: {
					url: profile.medium_url,
					username: profile.medium_username,
				},
				devto: {
					url: profile.devto_url,
					username: profile.devto_username,
				},
				other: {
					platform: profile.other_platform,
					url: profile.other_url,
					username: profile.other_username,
				},
			},
			createdAt: profile.created_at,
			updatedAt: profile.updated_at,
		};
	},
};

module.exports = SocialProfileService;
