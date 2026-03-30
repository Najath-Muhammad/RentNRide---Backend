import type { NextFunction, Request, Response } from "express";

export interface IuserController {
	getProfile(req: Request, res: Response, next: NextFunction): Promise<Response>;
	updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response>;
	updateProfilePhoto(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	changePassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
	getSubscription(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	upgradePremium(req: Request, res: Response, next: NextFunction): Promise<Response>;
}
