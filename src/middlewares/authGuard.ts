import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ROLES } from "../constants/roles";
import { UserModel } from "../model/user.model";
import { verifyToken } from "../utils/jwt-service.utils";

export const AuthGuard =
	(roles: Array<string>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.cookies?.accessToken;
			if (!token) {
				return res.status(401).json({
					success: false,
					message: "Token missing",
				});
			}

			const jwtSecret = env.JWT_SECRET_KEY;
			if (!jwtSecret) {
				return res.status(500).json({
					success: false,
					message: "Server configuration error",
				});
			}

			const verify = verifyToken(token, jwtSecret) as {
				email: string;
				userId: string;
				role: string;
				name: string;
			};

			if (!verify) {
				return res.status(401).json({
					success: false,
					message: "Invalid token",
				});
			}

			if (!roles.includes(verify.role)) {
				return res.status(403).json({
					success: false,
					message: "You don't have permission to access this resource",
				});
			}

			if (verify.role === ROLES.USER || verify.role === ROLES.PREMIUM) {
				const user = await UserModel.findById(verify.userId);
				if (user?.isBlocked) {
					return res.status(403).json({
						success: false,
						message: "Your account has been blocked by admin.",
						blocked: true,
						logout: true,
					});
				}
			}

			req.user = verify;
			next();
		} catch (_error) {
			return res.status(401).json({
				success: false,
				message: "Invalid or expired token",
			});
		}
	};
