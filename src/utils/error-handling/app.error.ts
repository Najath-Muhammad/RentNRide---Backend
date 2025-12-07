import { HttpStatus } from "../../constants/enum/StatusCode";
import { BaseError } from "./base-error";

/**
 * Generic, flexible application-level error.
 * Used when no specific domain error fits.
 */

export default class AppError extends BaseError {
  public readonly data?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    data?: unknown,
  ) {
    super("AppError", statusCode, true, message);
    this.data = data;
  }
}
