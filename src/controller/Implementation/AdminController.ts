import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/StatusCode";
import { MESSAGES } from "../../constants/messages/messageConstants";
import type { IAdminService } from "../../services/Interfaces/IAdminServices";
import logger from "../../utils/logger";
import type { IAdminController } from "../interfaces/IAdminController";

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
			return res.status(HttpStatus.OK).json({ success: true, users });
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json('error in finding all users');
		}
	}

	async blockUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.blockUser(userId);
			return res
				.status(HttpStatus.OK)
				.json({ success: true, message: MESSAGES.USER.BLOCKED, data: result });
		} catch (error) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({
					success: false,
					message: MESSAGES.ERRORS.SERVER_ERROR,
				});
		}
	}

	async unblockUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.unBlockUser(userId);
			return res
				.status(HttpStatus.OK)
				.json({
					success: true,
					message: MESSAGES.USER.UNBLOCKED,
					data: result,
				});
		} catch (error) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({
					success: false,
					message: MESSAGES.ERRORS.SERVER_ERROR
				});
		}
	}

	async deleteUser(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = req.params;
			const result = await this._adminService.deleteUser(userId);
			return res
				.status(HttpStatus.OK)
				.json({ success: true, message: MESSAGES.USER.DELETED, data: result });
		} catch (error) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({
					success: false,
					message: MESSAGES.ERRORS.SERVER_ERROR
				});
		}
	}
}
