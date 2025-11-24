import path from "node:path";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}] ${message}`;
		}),
	),
	transports: [
		new transports.Console(),

		new transports.File({
			filename: path.join(process.cwd(), "src", "logs", "error.log"),
			level: "error",
		}),

		new transports.File({
			filename: path.join(process.cwd(), "src", "logs", "combined.log"),
			level: "info",
		}),
	],
});

export default logger;
