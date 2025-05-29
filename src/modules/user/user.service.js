const bcrypt = require("bcryptjs");
const User = require("../user/user.model");

class UserService {
	static async findUserById(id) {
		return User.findById(id).select("-password");
	}

	static async findUserByEmail(email) {
		return User.findOne({ email });
	}

	static async findUserByGoogleId(googleId) {
		return User.findOne({ googleId }).select("-password");
	}

	static async createUser(userData) {
		const user = new User(userData);
		await user.save();
		const { password, ...userWithoutPassword } = user.toObject();
		return userWithoutPassword;
	}

	static async findUserByAPIKey(apiCreds) {
		const { apiKey, apiSecret } = apiCreds[0];

		const user = await User.findOne({
			"apiCredentials.apiKey": apiKey,
		}).select("-password");
		if (!user) return null;

		const credential = user.apiCredentials.find((c) => c.apiKey === apiKey);
		console.log(typeof apiSecret, typeof credential.apiSecret);
		if (!credential) return null;

		const isValidSecret = Boolean(apiSecret === credential.apiSecret);
		if (!isValidSecret) return null;
		return user;
	}

	static async updateUser(user, updates) {
		Object.assign(user, updates);
		user.updatedAt = new Date();
		return await user.save();
	}
}

module.exports = UserService;
