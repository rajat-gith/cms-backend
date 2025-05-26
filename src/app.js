const express = require("express");
const cors = require("cors");
const config = require("./config");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const educationRoutes = require("./modules/education/education.routes");
const projectRoutes = require("./modules/project/project.routes");
const experienceRoutes = require("./modules/experience/experience.routes");

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendUrl }));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/education", educationRoutes);
app.use("/project", projectRoutes);
app.use("/experience", experienceRoutes);

// Basic health check
app.get("/", (req, res) => {
	res.send("API is running!");
});

module.exports = app;
