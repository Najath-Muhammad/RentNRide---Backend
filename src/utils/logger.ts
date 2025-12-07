import path from "node:path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const retentionDays = 7;

const dailyRotateTransport = (
	filename: string,
	level?: string,
): DailyRotateFile => {
	return new DailyRotateFile({
		filename: path.join(process.cwd(), "src", "logs", filename),
		datePattern: "YYYY-MM-DD",
		zippedArchive: true,
		maxSize: "20m",
		maxFiles: `${retentionDays}d`,
		level,
		format: format.combine(
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.printf(({ timestamp, level, message }) => {
				return `${timestamp} [${level.toUpperCase()}] ${message}`;
			}),
		),
	});
};

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

		dailyRotateTransport("error-%DATE%.log", "error"),
		dailyRotateTransport("combined-%DATE%.log", "info"),
	],
});

export default logger;
