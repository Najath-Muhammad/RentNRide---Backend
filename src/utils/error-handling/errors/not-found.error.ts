import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

export class NotFoundError extends BaseError {
	constructor(description = "Resource not found") {
		super("NotFoundError", HttpStatus.NOT_FOUND, true, description);
	}
}
