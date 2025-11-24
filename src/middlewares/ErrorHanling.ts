import { ErrorRequestHandler } from "express";
import logger from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err);

  const statusCode = (err as any).statusCode || 500;
  const message = err instanceof Error ? err.message : "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
