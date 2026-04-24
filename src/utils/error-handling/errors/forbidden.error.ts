import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

/** 403 - user authenticated but not allowed */
export class ForbiddenError extends BaseError {
	constructor(description = "Forbidden") {
		super("ForbiddenError", HttpStatus.FORBIDDEN, true, description);
	}
}
