import { config } from "dotenv";
import { app } from "./app";
import connectDB from "./config/db.config";
import redisClient from "./config/redis.config";
import logger from "./utils/logger";

config();

const PORT = process.env.PORT || 5000;

console.log("✅ Server started successfully");
logger.info("Server started...");
logger.error("This is a test error");

async function bootstrap() {
	await connectDB();
	await redisClient.connect();

<<<<<<< Updated upstream
	app.listen(PORT, () =>
		console.log("server starting on http://locahost:5000"),
=======
	const httpServer = createServer(app);

	initSocket(httpServer);

	httpServer.listen(PORT, () =>
		console.log(`Server running on http://localhost:${PORT}`),
>>>>>>> Stashed changes
	);
}

bootstrap();
