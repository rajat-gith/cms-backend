const FSM = require("./blog.fsm");

function getEffectiveUserRole(blog, user) {
	if (String(blog.author.userId) === String(user.userId)) return "admin";
	const collaborator = blog.collaborators.find(
		(c) => String(c.userId) === String(user.userId)
	);
	return collaborator?.role || "viewer";
}

async function transitionState(blog, event, user) {
	const transitions = FSM.FSM[blog.state];
	console.log(transitions);
	if (!transitions || !transitions[event]) {
		throw new Error(
			`Invalid transition '${event}' from state '${blog.state}'`
		);
	}

	const { allowedRoles, newState } = transitions[event];
	const role = getEffectiveUserRole(blog, user);

	if (!allowedRoles.includes(role)) {
		throw new Error(
			`User role '${role}' not permitted to perform '${event}'`
		);
	}

	if (event === "start_editing") {
		const now = new Date();
		blog.lockedBy = user.userId;
		blog.lockedAt = now;
		blog.lockExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);
	}

	if (
		[
			"submit_review",
			"stop_editing",
			"approve",
			"reject",
			"publish",
		].includes(event)
	) {
		blog.lockedBy = null;
		blog.lockedAt = null;
		blog.lockExpiresAt = null;
	}

	blog.status = newState;
	blog.updatedAt = new Date();
	return await blog.save();
}

module.exports = {
	transitionState,
	getEffectiveUserRole,
};
