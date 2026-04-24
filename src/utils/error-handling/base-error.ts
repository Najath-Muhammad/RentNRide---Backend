import { HttpStatus } from "../../constants/enum/statuscode";
export class BaseError extends Error {
	public readonly name: string;
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly description: string;

	constructor(
		name: string,
		statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
		isOperational: boolean = true,
		description: string = "Unexpected error occurred",
	) {
		super(description);

		Object.setPrototypeOf(this, new.target.prototype);
		this.name = name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.description = description;

		Error.captureStackTrace(this);
	}
}
