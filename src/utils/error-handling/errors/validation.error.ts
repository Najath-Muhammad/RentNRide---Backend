import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

/** 400 - input validation failed */
export class ValidationError extends BaseError {
	public readonly details?: Record<string, string>;

	constructor(description = "Invalid input", details?: Record<string, string>) {
		super("ValidationError", HttpStatus.BAD_REQUEST, true, description);
		this.details = details;
	}
}
