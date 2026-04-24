import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

export class UnauthorizedError extends BaseError {
	constructor(description = "Unauthorized") {
		super("UnauthorizedError", HttpStatus.UNAUTHORIZED, true, description);
	}
}
