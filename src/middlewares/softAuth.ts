import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyToken } from "../utils/jwt-service.utils";

export const SoftAuth = (req: Request, _res: Response, next: NextFunction) => {
	try {
		const cookieToken = req.cookies?.accessToken;
		const headerToken = req.headers.authorization?.replace("Bearer ", "");
		const token = cookieToken || headerToken;
		if (!token) {
			return next();
		}

		const jwtSecret = env.JWT_SECRET_KEY;
		if (!jwtSecret) {
			return next();
		}

		const verify = verifyToken(token, jwtSecret) as {
			email: string;
			userId: string;
			role: string;
			name: string;
		};

		if (verify) {
			req.user = verify;
		}
		next();
	} catch (_error) {
		// Silent fail - public routes should still work
		next();
	}
};
