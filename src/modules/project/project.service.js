const pool = require("../../db/index");
const ProjectQueries = require("./project.queries");

class ProjectService {
	static async addProject(data) {
		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			const {
				userId,
				title,
				description,
				technologies,
				role,
				teamSize,
				projectType,
				teamMembers,
				otherLinks,
				repositoryLink,
				liveDemoLink,
				achievements,
				duration,
			} = data;

			const projectResult = await client.query(
				ProjectQueries._insertProject(),
				[
					userId,
					title,
					description,
					technologies || [],
					role,
					teamSize,
					projectType || "individual",
					JSON.stringify(otherLinks || []),
					repositoryLink,
					liveDemoLink,
					achievements || [],
					duration?.startDate || null,
					duration?.endDate || null,
					duration?.isOngoing || false,
				]
			);

			const project = projectResult.rows[0];

			if (teamMembers && teamMembers.length > 0) {
				for (const member of teamMembers) {
					const memberResult = await client.query(
						ProjectQueries._insertTeamMember(),
						[
							project.id,
							member.name,
							member.linkedinURL || null,
							member.twitterURL || null,
						]
					);

					const teamMember = memberResult.rows[0];

					if (member.otherLinks && member.otherLinks.length > 0) {
						for (const link of member.otherLinks) {
							await client.query(
								ProjectQueries._insertTeamMemberOtherLink(),
								[
									teamMember.id,
									link.platform,
									link.url,
								]
							);
						}
					}
				}
			}

			await client.query("COMMIT");

			return await this.getProjectById(project.id);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async getProjectsByUser(userId) {
		const client = await pool.connect();

		try {
			const projectsResult = await client.query(
				ProjectQueries._getProjectsByUser(),
				[userId]
			);

			const projects = projectsResult.rows;

			if (projects.length === 0) {
				return [];
			}

			for (const project of projects) {
				const teamMembersResult = await client.query(
					ProjectQueries._getTeamMembersByProject(),
					[project.id]
				);

				const teamMembers = teamMembersResult.rows;

				if (teamMembers.length > 0) {
					const memberIds = teamMembers.map(
						(member) => member.id
					);

					const otherLinksResult = await client.query(
						ProjectQueries._getTeamMemberOtherLinks(),
						[memberIds]
					);

					const otherLinksByMember = {};

					otherLinksResult.rows.forEach((link) => {
						if (!otherLinksByMember[link.teamMemberId]) {
							otherLinksByMember[link.teamMemberId] = [];
						}

						otherLinksByMember[link.teamMemberId].push({
							platform: link.platform,
							url: link.url,
						});
					});

					teamMembers.forEach((member) => {
						member.otherLinks =
							otherLinksByMember[member.id] || [];
					});
				}

				project.teamMembers = teamMembers.map((member) => ({
					name: member.name,
					linkedinURL: member.linkedinURL,
					twitterURL: member.twitterURL,
					otherLinks: member.otherLinks || [],
				}));

				project.duration = {
					startDate: project.startDate,
					endDate: project.endDate,
					isOngoing: project.isOngoing,
				};

				if (project.achievements) {
					if (
						Array.isArray(project.achievements) &&
						project.achievements.length === 1 &&
						typeof project.achievements[0] === "string" &&
						project.achievements[0].startsWith("[") &&
						project.achievements[0].endsWith("]")
					) {
						try {
							project.achievements = JSON.parse(project.achievements[0]);
						} catch (e) {
							// fallback
						}
					}
				} else {
					project.achievements = [];
				}

				delete project.startDate;
				delete project.endDate;
				delete project.isOngoing;
			}

			return projects;
		} finally {
			client.release();
		}
	}

	static async getProjectById(projectId) {
		const client = await pool.connect();

		try {
			const projectResult = await client.query(
				ProjectQueries._getProjectById(),
				[projectId]
			);

			if (projectResult.rows.length === 0) {
				return null;
			}

			const project = projectResult.rows[0];

			const teamMembersResult = await client.query(
				ProjectQueries._getTeamMembersByProject(),
				[projectId]
			);

			const teamMembers = teamMembersResult.rows;

			if (teamMembers.length > 0) {
				const memberIds = teamMembers.map(
					(member) => member.id
				);

				const otherLinksResult = await client.query(
					ProjectQueries._getTeamMemberOtherLinks(),
					[memberIds]
				);

				const otherLinksByMember = {};

				otherLinksResult.rows.forEach((link) => {
					if (!otherLinksByMember[link.teamMemberId]) {
						otherLinksByMember[link.teamMemberId] = [];
					}

					otherLinksByMember[link.teamMemberId].push({
						platform: link.platform,
						url: link.url,
					});
				});

				teamMembers.forEach((member) => {
					member.otherLinks =
						otherLinksByMember[member.id] || [];
				});
			}

			project.teamMembers = teamMembers.map((member) => ({
				name: member.name,
				linkedinURL: member.linkedinURL,
				twitterURL: member.twitterURL,
				otherLinks: member.otherLinks || [],
			}));

			project.duration = {
				startDate: project.startDate,
				endDate: project.endDate,
				isOngoing: project.isOngoing,
			};

			if (project.achievements) {
				if (
					Array.isArray(project.achievements) &&
					project.achievements.length === 1 &&
					typeof project.achievements[0] === "string" &&
					project.achievements[0].startsWith("[") &&
					project.achievements[0].endsWith("]")
				) {
					try {
						project.achievements = JSON.parse(project.achievements[0]);
					} catch (e) {
						// fallback
					}
				}
			} else {
				project.achievements = [];
			}

			delete project.startDate;
			delete project.endDate;
			delete project.isOngoing;

			return project;
		} finally {
			client.release();
		}
	}

	static async updateProject(projectId, updates) {
		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			const {
				title,
				description,
				technologies,
				role,
				teamSize,
				projectType,
				teamMembers,
				otherLinks,
				repositoryLink,
				liveDemoLink,
				achievements,
				duration,
			} = updates;

			const projectResult = await client.query(
				ProjectQueries._updateProject(),
				[
					projectId,
					title ?? null,
					description ?? null,
					technologies ?? null,
					role ?? null,
					teamSize ?? null,
					projectType ?? null,
					otherLinks !== undefined
						? JSON.stringify(otherLinks)
						: null,
					repositoryLink ?? null,
					liveDemoLink ?? null,
					achievements !== undefined
						? achievements
						: null,
					duration?.startDate ?? null,
					duration?.endDate ?? null,
					duration?.isOngoing ?? null,
				]
			);

			if (projectResult.rows.length === 0) {
				throw new Error("Project not found");
			}

			if (teamMembers !== undefined) {
				await client.query(
					ProjectQueries._deleteTeamMembersByProject(),
					[projectId]
				);

				if (teamMembers && teamMembers.length > 0) {
					for (const member of teamMembers) {
						const memberResult = await client.query(
							ProjectQueries._insertTeamMember(),
							[
								projectId,
								member.name,
								member.linkedinURL || null,
								member.twitterURL || null,
							]
						);

						const teamMember = memberResult.rows[0];

						if (
							member.otherLinks &&
							member.otherLinks.length > 0
						) {
							for (const link of member.otherLinks) {
								await client.query(
									ProjectQueries._insertTeamMemberOtherLink(),
									[
										teamMember.id,
										link.platform,
										link.url,
									]
								);
							}
						}
					}
				}
			}

			await client.query("COMMIT");

			return await this.getProjectById(projectId);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	static async deleteProject(projectId) {
		const client = await pool.connect();

		try {
			const result = await client.query(
				ProjectQueries._deleteProject(),
				[projectId]
			);

			if (result.rows.length === 0) {
				throw new Error("Project not found");
			}

			return result.rows[0];
		} finally {
			client.release();
		}
	}
}

module.exports = ProjectService;