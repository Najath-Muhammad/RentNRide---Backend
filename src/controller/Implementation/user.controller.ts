import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IUserService } from "../../services/interfaces/user.interface.service";
import type { IUser } from "../../types/user/IUser";
import { userDTO } from "../../utils/mapper/authService.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	changePasswordSchema,
	updateProfilePhotoSchema,
	updateProfileSchema,
} from "../../validations/commonValidation";
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
			return successResponse(res, "Profile fetched successfully", {
				user: userDTO(user as IUser),
			});
		} catch (error) {
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
			const parsed = updateProfileSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}

			await this._userService.updateProfile(
				(req as AuthenticatedRequest).user.userId,
				parsed.data,
			);
			return successResponse(res, "Profile updated successfully");
		} catch (error) {
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
			const parsed = updateProfilePhotoSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { profilePhoto } = parsed.data;
			const url = await this._userService.updateProfilePhoto(
				(req as AuthenticatedRequest).user.userId,
				profilePhoto,
			);
			return successResponse(res, "Profile photo updated successfully", {
				profilePhoto: url,
			});
		} catch (error) {
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
			const parsed = changePasswordSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { currentPassword, newPassword } = parsed.data;
			await this._userService.changePassword(
				(req as AuthenticatedRequest).user.userId,
				currentPassword,
				newPassword,
			);
			return successResponse(res, "Password updated successfully");
		} catch (error) {
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
            return errorResponse(
				res,
				"Failed to upgrade to premium",
				HttpStatus.BAD_REQUEST,
				error,
			);
        }
	};
}
