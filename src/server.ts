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
	await redisClient.connect(); const httpServer = createServer(app);

	initSocket(httpServer);

	httpServer.listen(PORT, () =>
		console.log(`Server running on http://localhost:${PORT}`)
	);
}

bootstrap()
