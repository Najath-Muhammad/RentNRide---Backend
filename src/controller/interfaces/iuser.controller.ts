import { NextFunction, Request, Response } from "express";

export interface IuserController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateProfilePhoto(req: Request, res: Response, next: NextFunction): Promise<any>;
  changePassword(req: Request, res: Response, next: NextFunction): Promise<any>;
  getSubscription(req: Request, res: Response, next: NextFunction): Promise<any>;
  upgradePremium(req: Request, res: Response, next: NextFunction): Promise<any>;
}