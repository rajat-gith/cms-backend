const Project = require("./project.model");

class ProjectService {
	static async addProject(data) {
		const project = new Project(data);
		return await project.save();
	}

	static async getProjectsByUser(userId) {
		return await Project.find({ userId });
	}

	static async updateProject(projectId, updates) {
		return await Project.findByIdAndUpdate(projectId, updates, {
			new: true,
		});
	}

	static async deleteProject(projectId) {
		return await Project.findByIdAndDelete(projectId);
	}
}

module.exports = ProjectService;
