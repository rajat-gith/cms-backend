const ProjectService = require("./project.service");

class ProjectController {
    static async addProject(req, res) {
        try {
            const data = { ...req.body, userId: req.user._id };
            const project = await ProjectService.addProject(data);
            res.status(201).json({ message: "Project created", data: project });
        } catch (err) {
            res.status(500).json({
                message: "Failed to create project",
                error: err.message,
            });
        }
    }

    static async getProjects(req, res) {
        try {
            const projects = await ProjectService.getProjectsByUser(
                req.user._id
            );
            res.json(projects);
        } catch (err) {
            res.status(500).json({
                message: "Failed to get projects",
                error: err.message,
            });
        }
    }

    static async updateProject(req, res) {
        try {
            const updated = await ProjectService.updateProject(
                req.params._id,
                req.body
            );
            res.json({ message: "Project updated", project: updated });
        } catch (err) {
            res.status(500).json({
                message: "Failed to update project",
                error: err.message,
            });
        }
    }

    static async deleteProject(req, res) {
        try {
            await ProjectService.deleteProject(req.params._id);
            res.json({ message: "Project deleted" });
        } catch (err) {
            res.status(500).json({
                message: "Failed to delete project",
                error: err.message,
            });
        }
    }
}

module.exports = ProjectController;
