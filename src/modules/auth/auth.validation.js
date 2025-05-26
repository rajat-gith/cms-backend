// auth.validation.js
const z = require("zod");

const authSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

module.exports = {
	authSchema,
};
