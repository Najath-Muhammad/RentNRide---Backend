import { HttpStatus } from "../constants/enum/StatusCode";
import AppError from "../utils/error-handling/app.error";
import { BaseError } from "../utils/error-handling/base-error";
import type { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {

  console.error("Error caught by middleware => ", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      data: err.data || null,
    });
  }

  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: false,
    message: "Something went wrong. Please try again later.",
  });
}