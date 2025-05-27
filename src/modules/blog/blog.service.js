const Blog = require("./blog.model");
const User = require("../user/user.model");

class BlogService {
	static async createBlog(data) {
		const blog = new Blog(data);
		return await blog.save();
	}

	static async getAllBlogs(userId) {
		return await Blog.find({ "author.userId": userId });
	}

	static async updateBlog(blogId, updates) {
		return await Blog.findByIdAndUpdate(blogId, updates, { new: true });
	}

	static async getBlogById(blogId) {
		return await Blog.findById(blogId);
	}

	static async getUserName(userId) {
		const author = await User.findById({ _id: userId });
		return author.username;
	}
}

module.exports = BlogService;
