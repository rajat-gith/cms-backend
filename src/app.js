const express = require("express");
const cors = require("cors");
const config = require("./config");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");

const app = express();

app.use(express.json());
app.use(cors({ origin: config.frontendUrl }));

// Routes
app.use("/auth", authRoutes); // All authentication related routes
app.use("/user", userRoutes); // All user profile related routes (protected)

// Basic health check
app.get("/", (req, res) => {
	res.send("API is running!");
});

module.exports = app;
