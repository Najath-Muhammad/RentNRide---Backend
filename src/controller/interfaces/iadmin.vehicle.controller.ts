import type { Request, Response } from "express";

export interface IAdminVehicleController {
	getAllVehicles(req: Request, res: Response): Promise<Response>;
}
