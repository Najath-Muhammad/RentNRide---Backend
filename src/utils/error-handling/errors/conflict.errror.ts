import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

/** 409 - resource already exists */
export class ConflictError extends BaseError {
	constructor(description = "Resource conflict") {
		super("ConflictError", HttpStatus.CONFLICT, true, description);
	}
}
