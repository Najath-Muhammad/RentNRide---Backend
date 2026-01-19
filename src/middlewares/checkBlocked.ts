import type { NextFunction, Request, Response } from "express";
import type { IAuthService } from "../services/Interfaces/auth.interface.service";
import logger from "../utils/logger";

export const checkBlocked = (userService: IAuthService) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const email = req.user?.email;
			console.log(email);

			if (!email) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized: No user email found",
					logout: true,
				});
			}

			const response = await userService.checkBlocked(email);
			console.log("this is the res", response);
			if (!response.success) {
				return res.status(403).json({
					success: false,
					message: response.message || "Your account has been blocked.",
					blocked: true,
					logout: true,
				});
			}

			next();
		} catch (error) {
			logger.error("checkBlocked middleware error:", error);
			return res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	};
};
