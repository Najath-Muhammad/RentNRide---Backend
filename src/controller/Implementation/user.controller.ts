import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IUserService } from "../../services/Interfaces/user.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IuserController } from "../interfaces/iuser.controller";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		role: string;
		email: string;
		name: string;
	};
}

export class UserController implements IuserController {
	constructor(private _userService: IUserService) {}

	getProfile = async (req: Request, res: Response) => {
		try {
			const user = await this._userService.getProfile(
				(req as AuthenticatedRequest).user.userId,
			);
			return successResponse(res, "Profile fetched successfully", { user });
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to fetch profile",
				HttpStatus.INTERNAL_SERVER_ERROR,
				error,
			);
		}
	};

	updateProfile = async (req: Request, res: Response) => {
		try {
			await this._userService.updateProfile(
				(req as AuthenticatedRequest).user.userId,
				req.body,
			);
			return successResponse(res, "Profile updated successfully");
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to update profile",
				HttpStatus.BAD_REQUEST,
				error,
			);
		}
	};

	updateProfilePhoto = async (req: Request, res: Response) => {
		try {
			const { profilePhoto } = req.body;
			const url = await this._userService.updateProfilePhoto(
				(req as AuthenticatedRequest).user.userId,
				profilePhoto,
			);
			return successResponse(res, "Profile photo updated successfully", {
				profilePhoto: url,
			});
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to update profile photo",
				HttpStatus.BAD_REQUEST,
				error,
			);
		}
	};

	changePassword = async (req: Request, res: Response) => {
		try {
			const { currentPassword, newPassword } = req.body;
			await this._userService.changePassword(
				(req as AuthenticatedRequest).user.userId,
				currentPassword,
				newPassword,
			);
			return successResponse(res, "Password updated successfully");
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to change password",
				HttpStatus.BAD_REQUEST,
				error,
			);
		}
	};

	getSubscription = async (req: Request, res: Response) => {
		try {
			const sub = await this._userService.getSubscriptionStatus(
				(req as AuthenticatedRequest).user.userId,
			);
			return successResponse(res, "Subscription status fetched", {
				subscription: sub,
			});
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to fetch subscription status",
				HttpStatus.INTERNAL_SERVER_ERROR,
				error,
			);
		}
	};

	upgradePremium = async (req: Request, res: Response) => {
		try {
			const sub = await this._userService.upgradeToPremium(
				(req as AuthenticatedRequest).user.userId,
			);
			return successResponse(res, "Upgraded to Premium!", {
				subscription: sub,
			});
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				"Failed to upgrade to premium",
				HttpStatus.BAD_REQUEST,
				error,
			);
		}
	};
}
