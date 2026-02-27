import { createServer } from "http";
import { config } from "dotenv";
import { app } from "./app";
import connectDB from "./config/db.config";
import redisClient from "./config/redis.config";
import logger from "./utils/logger";
import { initSocket } from "./utils/socket";

config();

const PORT = process.env.PORT || 5000;

console.log("✅ Server started successfully");
logger.info("Server started...");

async function bootstrap() {
	await connectDB();
	await redisClient.connect();

	// Create a plain HTTP server so Socket.IO can attach to it
	const httpServer = createServer(app);

	// Initialize Socket.IO
	initSocket(httpServer);

	httpServer.listen(PORT, () =>
		console.log(`Server running on http://localhost:${PORT}`),
	);
}

bootstrap();
