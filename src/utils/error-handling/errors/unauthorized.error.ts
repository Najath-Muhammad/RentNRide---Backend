import { HttpStatus } from "../../../constants/enum/StatusCode";
import { BaseError } from "../base-error";

/** 401 - user not authenticated */
export class UnauthorizedError extends BaseError {
  constructor(description = "Unauthorized") {
    super("UnauthorizedError", HttpStatus.UNAUTHORIZED, true, description);
  }
}
