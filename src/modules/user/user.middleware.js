const bcrypt = require("bcryptjs");


const passwordHashingMiddleware = (schema) => {
	schema.pre("save", async function (next) {
		if (this.isModified("password") && this.password) {
			const salt = await bcrypt.genSalt(10);
			this.password = await bcrypt.hash(this.password, salt);
		}
		next();
	});
};


const passwordComparisonMethod = (schema) => {
	schema.methods.comparePassword = async function (candidatePassword) {
		const userWithPassword = await this.model("User")
			.findById(this._id)
			.select("+password");

		if (!userWithPassword || !userWithPassword.password) {
			return false;
		}
		return bcrypt.compare(candidatePassword, userWithPassword.password);
	};
};

module.exports = {
	passwordHashingMiddleware,
	passwordComparisonMethod,
};
