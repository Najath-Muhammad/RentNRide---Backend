import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import { errorResponse, successResponse } from "../../utils/response.util";
import { fcmTokenSchema } from "../../validations/commonValidation";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class FcmController {
	constructor(private _userRepo: IUserRepository) {}

	/** POST /api/fcm/token — register a device token for the authenticated user */
	async registerToken(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).user as { userId: string };
		const parsed = fcmTokenSchema.safeParse(req.body);
		if (!parsed.success) {
			errorResponse(
				res,
				parsed.error.issues[0].message,
				HttpStatus.BAD_REQUEST,
			);
			return;
		}
		const { token } = parsed.data;

		await this._userRepo.addFcmToken(userId, token);
		console.log(
			`[FCM] Token registered for user ${userId}: ${token.slice(0, 20)}...`,
		);
		successResponse(res, "FCM token registered");
	}

	/** DELETE /api/fcm/token — remove a device token (on logout / token refresh) */
	async removeToken(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).user as { userId: string };
		const parsed = fcmTokenSchema.safeParse(req.body);
		if (!parsed.success) {
			errorResponse(
				res,
				parsed.error.issues[0].message,
				HttpStatus.BAD_REQUEST,
			);
			return;
		}
		const { token } = parsed.data;

		await this._userRepo.removeFcmToken(userId, token);
		successResponse(res, "FCM token removed");
	}
}
