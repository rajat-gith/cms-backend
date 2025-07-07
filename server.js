const app = require("./src/app");
const config = require("./src/config");
const connectDB = require("./src/utils/db"); 

// Connect to MongoDB
// connectDB();

app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`);
	console.log(`Frontend URL allowed: ${config.frontendDeployedUrl}`);
});
