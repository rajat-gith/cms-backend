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

	static async updateUser(user, updates) {
		Object.assign(user, updates);
		user.updatedAt = new Date();
		return await user.save();
	}
}

module.exports = UserService;
