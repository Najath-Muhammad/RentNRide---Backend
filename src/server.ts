import { createServer } from "node:http";
import { app } from "./app";
import connectDB from "./config/db.config";
import { env } from "./config/env";
import { initFirebase } from "./config/firebase.config";
import redisClient from "./config/redis.config";
import logger from "./utils/logger";
import { initSocket } from "./utils/socket";

const PORT = env.PORT || 5000;

logger.info("Server started...");

async function bootstrap() {
	await connectDB();
	await redisClient.connect();
	initFirebase();
	const httpServer = createServer(app);

	initSocket(httpServer);

	httpServer.listen(PORT, () =>
		console.log(`Server running on http://localhost:${PORT}`),
	);
}

bootstrap();
