import { HttpStatus } from "../../../constants/enum/statuscode";
import { BaseError } from "../base-error";

export class ServiceUnavailableError extends BaseError {
	constructor(description = "Service unavailable") {
		super(
			"ServiceUnavailableError",
			HttpStatus.SERVICE_UNAVAILABLE,
			false,
			description,
		);
	}
}
