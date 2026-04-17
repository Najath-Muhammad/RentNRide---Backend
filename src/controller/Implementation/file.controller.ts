import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IFileService } from "../../services/interfaces/file.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { fileUploadSchema } from "../../validations/commonValidation";
import type { IFileController } from "../interfaces/ifile.controller";

export class FileController implements IFileController {
	constructor(private _fileService: IFileService) {}

	async generateUploadUrl(req: Request, res: Response): Promise<Response> {
		try {
			const parsed = fileUploadSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { fileName, fileType } = parsed.data;

			const response = await this._fileService.generateUploadUrl(
				fileName,
				fileType,
			);

			console.log("upload url", response.uploadUrl);

			return successResponse(res, "Upload URL generated", {
				uploadUrl: response.uploadUrl,
				publicUrl: response.publicUrl,
			});
		} catch (error) {
			console.error("Generate upload URL error:", error);
			return errorResponse(
				res,
				"Failed to generate upload URL",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
