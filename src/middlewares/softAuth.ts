import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt-service.utils";

export const SoftAuth = (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies?.accessToken;
		if (!token) {
			return next();
		}

		const verify = verifyToken(token, process.env.JWT_SECRET_KEY!) as {
			email: string;
			userId: string;
			role: string;
			name: string;
		};

		if (verify) {
			req.user = verify;
		}
		next();
	} catch (error) {
		// Silent fail - public routes should still work
		next();
	}
};
