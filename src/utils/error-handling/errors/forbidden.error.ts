import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

export class ForbiddenError extends BaseError {
	constructor(description = "Forbidden") {
		super("ForbiddenError", HttpStatus.FORBIDDEN, true, description);
	}
}
