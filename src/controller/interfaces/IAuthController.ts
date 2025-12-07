import type { NextFunction, Request, Response } from "express";

export interface IAuthController {
	signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
	verifyOtp(req: Request, res: Response, next: NextFunction): Promise<Response>;
	resendOtp(req: Request, res: Response ,next: NextFunction): Promise<Response>;
	login(req: Request, res: Response ,next: NextFunction): Promise<Response>;
	adminLogin(req: Request, res: Response ,next: NextFunction): Promise<Response>;
	refreshToken(req: Request, res: Response ,next: NextFunction): Promise<Response>;
	exampleRoute(req: Request, res: Response ,next: NextFunction): Promise<Response>;
}
