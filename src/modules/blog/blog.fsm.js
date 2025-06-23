const STATES = {
	DRAFT: "draft",
	EDITING: "editing",
	AWAITING_REVIEW: "awaiting_review",
	PUBLISHED: "published",
	LOCKED: "locked",
	CONFLICT: "conflict",
};

const EVENTS = {
	START_EDIT: "start_editing",
	STOP_EDIT: "stop_editing",
	REQUEST_REVIEW: "submit_review",
	APPROVE: "approve",
	REJECT: "reject",
	PUBLISH: "publish",
	FORCE_UNLOCK: "force_unlock",
	RESOLVE_CONFLICT: "resolve_conflict",
};

const FSM = {
	[STATES.DRAFT]: {
		[EVENTS.START_EDIT]: {
			newState: STATES.EDITING,
			allowedRoles: ["admin", "editor"],
			requiresLock: true,
		},
	},
	[STATES.EDITING]: {
		[EVENTS.STOP_EDIT]: {
			newState: STATES.DRAFT,
			allowedRoles: ["admin", "editor"],
			releasesLock: true,
		},
		[EVENTS.REQUEST_REVIEW]: {
			newState: STATES.AWAITING_REVIEW,
			allowedRoles: ["admin", "editor"],
			releasesLock: true,
		},
	},
	[STATES.AWAITING_REVIEW]: {
		[EVENTS.APPROVE]: {
			newState: STATES.PUBLISHED,
			allowedRoles: ["admin"],
			releasesLock: true,
		},
		[EVENTS.REJECT]: {
			newState: STATES.DRAFT,
			allowedRoles: ["admin"],
			releasesLock: true,
		},
	},
	[STATES.PUBLISHED]: {
		[EVENTS.START_EDIT]: {
			newState: STATES.EDITING,
			allowedRoles: ["admin"],
			requiresLock: true,
		},
	},
	[STATES.LOCKED]: {
		[EVENTS.FORCE_UNLOCK]: {
			newState: STATES.DRAFT,
			allowedRoles: ["admin"],
			releasesLock: true,
		},
	},
	[STATES.CONFLICT]: {
		[EVENTS.RESOLVE_CONFLICT]: {
			newState: STATES.DRAFT,
			allowedRoles: ["admin"],
			releasesLock: true,
		},
	},
};

module.exports = {
	STATES,
	EVENTS,
	FSM,
};
