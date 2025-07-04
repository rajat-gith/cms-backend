const _insertProject = () => `
    INSERT INTO projects (
        user_id, title, description, technologies, role, team_size, 
        project_type, other_links, repository_link, live_demo_link, 
        achievements, start_date, end_date, is_ongoing
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, user_id, title, description, technologies, role, team_size, 
              project_type, other_links, repository_link, live_demo_link, 
              achievements, start_date, end_date, is_ongoing, created_at, updated_at
`;

const _getProjectsByUser = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
`;

const _getProjectById = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.id = $1
`;

const _updateProject = () => `
    UPDATE projects 
    SET title = COALESCE($2, title),
        description = COALESCE($3, description),
        technologies = COALESCE($4, technologies),
        role = COALESCE($5, role),
        team_size = COALESCE($6, team_size),
        project_type = COALESCE($7, project_type),
        other_links = COALESCE($8, other_links),
        repository_link = COALESCE($9, repository_link),
        live_demo_link = COALESCE($10, live_demo_link),
        achievements = COALESCE($11, achievements),
        start_date = COALESCE($12, start_date),
        end_date = COALESCE($13, end_date),
        is_ongoing = COALESCE($14, is_ongoing),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, user_id, title, description, technologies, role, team_size, 
              project_type, other_links, repository_link, live_demo_link, 
              achievements, start_date, end_date, is_ongoing, created_at, updated_at
`;

const _deleteProject = () => `
    DELETE FROM projects WHERE id = $1
    RETURNING id
`;

const _insertTeamMember = () => `
    INSERT INTO team_members (project_id, name, linkedin_url, twitter_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, project_id, name, linkedin_url, twitter_url, created_at
`;

const _getTeamMembersByProject = () => `
    SELECT 
        tm.id, tm.project_id, tm.name, tm.linkedin_url, tm.twitter_url, tm.created_at
    FROM team_members tm
    WHERE tm.project_id = $1
    ORDER BY tm.created_at ASC
`;

const _getTeamMembersByProjects = () => `
    SELECT 
        tm.id, tm.project_id, tm.name, tm.linkedin_url, tm.twitter_url, tm.created_at
    FROM team_members tm
    WHERE tm.project_id = ANY($1)
    ORDER BY tm.project_id, tm.created_at ASC
`;

const _deleteTeamMembersByProject = () => `
    DELETE FROM team_members WHERE project_id = $1
    RETURNING id
`;

const _insertTeamMemberOtherLink = () => `
    INSERT INTO team_member_other_links (team_member_id, platform, url)
    VALUES ($1, $2, $3)
    RETURNING id, team_member_id, platform, url, created_at
`;

const _getTeamMemberOtherLinks = () => `
    SELECT 
        tmol.id, tmol.team_member_id, tmol.platform, tmol.url, tmol.created_at
    FROM team_member_other_links tmol
    WHERE tmol.team_member_id = ANY($1)
    ORDER BY tmol.team_member_id, tmol.created_at ASC
`;

const _deleteTeamMemberOtherLinksByMember = () => `
    DELETE FROM team_member_other_links WHERE team_member_id = $1
    RETURNING id
`;

const _checkProjectExists = () => `
    SELECT id FROM projects WHERE id = $1
`;

const _checkProjectOwnership = () => `
    SELECT id FROM projects WHERE id = $1 AND user_id = $2
`;

const _getProjectCount = () => `
    SELECT COUNT(*) as count FROM projects WHERE user_id = $1
`;

const _getProjectsByUserWithPagination = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
`;

const _searchProjects = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1 
    AND (
        p.title ILIKE $2 OR 
        p.description ILIKE $2 OR 
        p.role ILIKE $2 OR
        EXISTS (
            SELECT 1 FROM unnest(p.technologies) AS tech 
            WHERE tech ILIKE $2
        )
    )
    ORDER BY p.created_at DESC
`;

const _getProjectsByTechnology = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1 
    AND $2 = ANY(p.technologies)
    ORDER BY p.created_at DESC
`;

const _getProjectsByDateRange = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1 
    AND p.start_date >= $2 
    AND (p.end_date <= $3 OR p.is_ongoing = true)
    ORDER BY p.created_at DESC
`;

const _getOngoingProjects = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1 AND p.is_ongoing = true
    ORDER BY p.created_at DESC
`;

const _getProjectsByType = () => `
    SELECT 
        p.id, p.user_id, p.title, p.description, p.technologies, p.role, 
        p.team_size, p.project_type, p.other_links, p.repository_link, 
        p.live_demo_link, p.achievements, p.start_date, p.end_date, 
        p.is_ongoing, p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = $1 AND p.project_type = $2
    ORDER BY p.created_at DESC
`;

module.exports = {
	_insertProject,
	_getProjectsByUser,
	_getProjectById,
	_updateProject,
	_deleteProject,
	_insertTeamMember,
	_getTeamMembersByProject,
	_getTeamMembersByProjects,
	_deleteTeamMembersByProject,
	_insertTeamMemberOtherLink,
	_getTeamMemberOtherLinks,
	_deleteTeamMemberOtherLinksByMember,
	_checkProjectExists,
	_checkProjectOwnership,
	_getProjectCount,
	_getProjectsByUserWithPagination,
	_searchProjects,
	_getProjectsByTechnology,
	_getProjectsByDateRange,
	_getOngoingProjects,
	_getProjectsByType,
};
