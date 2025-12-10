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
					duration?.startDate,
					duration?.endDate,
					duration?.isOngoing || false,
				]
			);

			const project = projectResult.rows[0];

			if (teamMembers && teamMembers.length > 0) {
				for (const member of teamMembers) {
					const memberResult = await client.query(
						ProjectQueries._insertTeamMember(),
						[
							project._id,
							member.name,
							member.linkedinURL,
							member.twitterURL,
						]
					);

					if (member.otherLinks && member.otherLinks.length > 0) {
						for (const link of member.otherLinks) {
							await client.query(
								ProjectQueries._insertTeamMemberOtherLink(),
								[
									memberResult.rows[0]._id,
									link.platform,
									link.url,
								]
							);
						}
					}
				}
			}

			await client.query("COMMIT");
			return await this.getProjectById(project._id);
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

			if (projects.length > 0) {
				for (const project of projects) {
					const teamMembersResult = await client.query(
						ProjectQueries._getTeamMembersByProject(),
						[project._id]
					);

					const teamMembers = teamMembersResult.rows;

					if (teamMembers.length > 0) {
						const memberIds = teamMembers.map((tm) => tm._id);
						const otherLinksResult = await client.query(
							ProjectQueries._getTeamMemberOtherLinks(),
							[memberIds]
						);

						const otherLinksByMember = {};
						otherLinksResult.rows.forEach((link) => {
							if (!otherLinksByMember[link.team_member_id]) {
								otherLinksByMember[link.team_member_id] = [];
							}
							otherLinksByMember[link.team_member_id].push({
								platform: link.platform,
								url: link.url,
							});
						});

						teamMembers.forEach((member) => {
							member.otherLinks =
								otherLinksByMember[member._id] || [];
						});
					}

					project.teamMembers = teamMembers.map((tm) => ({
						name: tm.name,
						linkedinURL: tm.linkedin_url,
						twitterURL: tm.twitter_url,
						otherLinks: tm.otherLinks || [],
					}));

					project.duration = {
						startDate: project.start_date,
						endDate: project.end_date,
						isOngoing: project.is_ongoing,
					};

					delete project.start_date;
					delete project.end_date;
					delete project.is_ongoing;
				}
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

			if (projectResult.rows.length === 0) return null;

			const project = projectResult.rows[0];

			const teamMembersResult = await client.query(
				ProjectQueries._getTeamMembersByProject(),
				[projectId]
			);

			const teamMembers = teamMembersResult.rows;

			if (teamMembers.length > 0) {
				const memberIds = teamMembers.map((tm) => tm._id);
				const otherLinksResult = await client.query(
					ProjectQueries._getTeamMemberOtherLinks(),
					[memberIds]
				);

				const otherLinksByMember = {};
				otherLinksResult.rows.forEach((link) => {
					if (!otherLinksByMember[link.team_member_id]) {
						otherLinksByMember[link.team_member_id] = [];
					}
					otherLinksByMember[link.team_member_id].push({
						platform: link.platform,
						url: link.url,
					});
				});

				teamMembers.forEach((member) => {
					member.otherLinks = otherLinksByMember[member._id] || [];
				});
			}

			project.teamMembers = teamMembers.map((tm) => ({
				name: tm.name,
				linkedinURL: tm.linkedin_url,
				twitterURL: tm.twitter_url,
				otherLinks: tm.otherLinks || [],
			}));

			project.duration = {
				startDate: project.start_date,
				endDate: project.end_date,
				isOngoing: project.is_ongoing,
			};

			delete project.start_date;
			delete project.end_date;
			delete project.is_ongoing;

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
					title,
					description,
					technologies,
					role,
					teamSize,
					projectType,
					otherLinks,
					repositoryLink,
					liveDemoLink,
					achievements,
					duration?.startDate,
					duration?.endDate,
					duration?.isOngoing,
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
								member.linkedinURL,
								member.twitterURL,
							]
						);

						if (member.otherLinks && member.otherLinks.length > 0) {
							for (const link of member.otherLinks) {
								await client.query(
									ProjectQueries._insertTeamMemberOtherLink(),
									[
										memberResult.rows[0]._id,
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
			const result = await client.query(ProjectQueries._deleteProject(), [
				projectId,
			]);

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
