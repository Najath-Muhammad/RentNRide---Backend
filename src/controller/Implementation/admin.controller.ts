import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import { MESSAGES } from "../../constants/messages/messageConstants";
import type { IAdminService } from "../../services/interfaces/admin.interface.service";
import logger from "../../utils/logger";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IAdminController } from "../interfaces/iadmin.controller";

export class AdminController implements IAdminController {
	constructor(private _adminService: IAdminService) {}

	async getAllUsers(req: Request, res: Response): Promise<Response> {
		try {
			const { page = 1, limit = 10, search = "", status } = req.query;
			const data = await this._adminService.getAllUsers({
				page: Number(page),
				limit: Number(limit),
				search: String(search),
				status: status ? String(status) : undefined,
			});
			logger.info("data", data.data);
			const users = data.data;
			return successResponse(res, "Users fetched successfully", { users });
		} catch (_error) {
			return errorResponse(
				res,
				"error in finding all users",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async blockUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.blockUser(userId);
			return successResponse(res, MESSAGES.USER.BLOCKED, result);
		} catch (_error) {
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async unblockUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.unBlockUser(userId);
			return successResponse(res, MESSAGES.USER.UNBLOCKED, result);
		} catch (_error) {
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.deleteUser(userId);
			return successResponse(res, MESSAGES.USER.DELETED, result);
		} catch (_error) {
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getDashboardStats(_req: Request, res: Response): Promise<Response> {
		try {
			const result = await this._adminService.getDashboardStats();
			return successResponse(
				res,
				"Dashboard stats fetched successfully",
				result.data,
			);
		} catch (_error) {
			logger.error("error in getDashboardStats", _error);
			return errorResponse(
				res,
				"Failed to fetch dashboard stats",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
