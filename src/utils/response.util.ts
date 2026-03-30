import type { Response } from "express";
import { HttpStatus } from "../constants/enum/statuscode";

export interface ISuccessResponse<T> {
	success: true;
	message: string;
	data?: T;
}

export const successResponse = <T>(
	res: Response,
	message: string,
	data?: T,
	statusCode: number = HttpStatus.OK,
): Response<ISuccessResponse<T>> => {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
	});
};

export interface IErrorResponse {
	success: false;
	message: string;
	error?: string;
}

export const errorResponse = (
	res: Response,
	message: string,
	statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
	error?: unknown,
): Response<IErrorResponse> => {
	const errorMessage =
		error instanceof Error ? error.message : String(error || message);

	return res.status(statusCode).json({
		success: false,
		message,
		error: errorMessage,
	});
};
