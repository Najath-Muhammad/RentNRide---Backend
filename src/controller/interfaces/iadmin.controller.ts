import type { Request, Response } from "express";

export interface IAdminController {
	getAllUsers(req: Request, res: Response): Promise<Response>;
	blockUser(req: Request, res: Response): Promise<Response>;
	unblockUser(req: Request, res: Response): Promise<Response>;
	deleteUser(req: Request, res: Response): Promise<Response>;
	getDashboardStats(req: Request, res: Response): Promise<Response>;
}
