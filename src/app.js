const express = require("express");
const cors = require("cors");
const config = require("./config");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const educationRoutes = require("./modules/education/education.routes");
const projectRoutes = require("./modules/project/project.routes");
const experienceRoutes = require("./modules/experience/experience.routes");
const blogRoutes = require("./modules/blog/blog.routes");
const extraRoutes = require("./modules/extra/extra.routes");
const certificationRoutes = require("./modules/certification/certification.routes");
const socialProfileRoutes = require("./modules/socialProfile/socialProfile.routes");
const skillRoutes = require("./modules/skill/skill.routes");

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendUrl }));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/education", educationRoutes);
app.use("/project", projectRoutes);
app.use("/experience", experienceRoutes);
app.use("/blog", blogRoutes);
app.use("/extra", extraRoutes);
app.use("/certification", certificationRoutes);
app.use("/socialProfile", socialProfileRoutes);
app.use("/skill", skillRoutes);

// Basic health check
app.get("/", (req, res) => {
	res.send("API is running!");
});

module.exports = app;
