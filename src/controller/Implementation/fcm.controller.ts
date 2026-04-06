import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import { errorResponse, successResponse } from "../../utils/response.util";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class FcmController {
	constructor(private _userRepo: IUserRepository) {}

	/** POST /api/fcm/token — register a device token for the authenticated user */
	async registerToken(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).user as { userId: string };
		const { token } = req.body as { token?: string };

		if (!token || typeof token !== "string") {
			errorResponse(res, "FCM token is required", HttpStatus.BAD_REQUEST);
			return;
		}

		await this._userRepo.addFcmToken(userId, token);
		console.log(
			`[FCM] Token registered for user ${userId}: ${token.slice(0, 20)}...`,
		);
		successResponse(res, "FCM token registered");
	}

	/** DELETE /api/fcm/token — remove a device token (on logout / token refresh) */
	async removeToken(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).user as { userId: string };
		const { token } = req.body as { token?: string };

		if (!token || typeof token !== "string") {
			errorResponse(res, "FCM token is required", HttpStatus.BAD_REQUEST);
			return;
		}

		await this._userRepo.removeFcmToken(userId, token);
		successResponse(res, "FCM token removed");
	}
}

