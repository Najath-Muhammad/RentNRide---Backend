import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import { MESSAGES } from "../../constants/messages/messageConstants";
import type { IAuthService } from "../../services/Interfaces/auth.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	changePasswordSchema,
	loginSchema,
	resetPassword,
	signupSchema,
	verifyEmailSchema,
	verifyOtpSchema,
} from "../../validations/authVallidatoin";
import type { IAuthController } from "../interfaces/iauth.controller";

export class AuthController implements IAuthController {
	constructor(private _authService: IAuthService) {}

	async signup(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const validated = signupSchema.parse(req.body);
			const { name, email, password } = validated;

			const result = await this._authService.signup({ name, email, password });

			return successResponse(res, result.message, undefined, HttpStatus.OK);
		} catch (error) {
			next(error);
			const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			const message = MESSAGES.ERRORS.SERVER_ERROR;

			return errorResponse(res, message, statusCode);
		}
	}

	async verifyEmail(req: Request, res: Response, next: NextFunction) {
		try {
			const { email } = verifyEmailSchema.parse(req.body);

			const response = await this._authService.verifyEmail(email);
			if (!response?.success) {
				return errorResponse(
					res,
					response?.message || "Error",
					HttpStatus.BAD_REQUEST,
				);
			}
			return successResponse(res, response?.message ?? MESSAGES.AUTH.OTP_SENT);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				MESSAGES.AUTH.EMAIL_REQUIRED,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async verifyOtp(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { otp, email } = verifyOtpSchema.parse(req.body);

			const result = await this._authService.verifyOtp(otp, email);

			res.cookie("accessToken", result.accessToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
			});

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
			});

			return successResponse(
				res,
				result.message || MESSAGES.AUTH.OTP_VERIFIED,
				{ user: result.user },
			);
		} catch (error) {
			next(error);
			console.error("Verify OTP controller error:", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.VALIDATION_ERROR,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async verifyOtpFor(req: Request, res: Response, next: NextFunction) {
		try {
			const { otp, email } = verifyOtpSchema.parse(req.body);

			const result = await this._authService.verifyOtpFor(otp, email);
			return successResponse(res, result.message || MESSAGES.AUTH.OTP_VERIFIED);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				MESSAGES.AUTH.OTP_EMAIL_REQUIRED,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async resetPassword(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { email, new_password } = resetPassword.parse(req.body);
			const password = new_password;

			const result = await this._authService.resetPassword(email, password);

			return successResponse(
				res,
				result?.message || MESSAGES.AUTH.PASSWORD_RESET,
			);
		} catch (error) {
			next(error);
			console.error("Reset Password controller error:", error);

			const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			const message = MESSAGES.ERRORS.SERVER_ERROR;

			return errorResponse(res, message, statusCode);
		}
	}

	async resendOtp(
		req: Request,
		res: Response,
		_next: NextFunction,
	): Promise<Response> {
		try {
			const { email } = verifyEmailSchema.parse(req.body);

			const result = await this._authService.resendOtp(email);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}
			return successResponse(res, result.message);
		} catch (error) {
			console.error("Resend OTP controller error:", error);

			return errorResponse(
				res,
				MESSAGES.AUTH.EMAIL_REQUIRED,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async login(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { email, password } = loginSchema.parse(req.body);

			const result = await this._authService.login(email, password);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.OK);
			}

			res.cookie("accessToken", result.accessToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
			});

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
			});

			return successResponse(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
				user: result.user,
			});
		} catch (error) {
			next(error);
			console.log("Login Error", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async logout(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const isProduction = process.env.NODE_ENV === "production";

			const cookieOptions = {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? ("none" as const) : ("lax" as const),
			};
			res.clearCookie("accessToken", cookieOptions);
			res.clearCookie("refreshToken", cookieOptions);

			return successResponse(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
		} catch (error) {
			next(error);
			console.error("Logout controller error:", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async adminLogin(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { email, password } = loginSchema.parse(req.body);

			const result = await this._authService.adminLogin(email, password);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.OK);
			}

			res.cookie("accessToken", result.accessToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
			});

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
			});

			return successResponse(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
				user: result.user,
			});
		} catch (error) {
			next(error);
			console.log("Admin Login Error", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async adminLogout(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const isProduction = process.env.NODE_ENV === "production";

			const cookieOptions = {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? ("none" as const) : ("lax" as const),
			};
			res.clearCookie("accessToken", cookieOptions);
			res.clearCookie("refreshToken", cookieOptions);

			return successResponse(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
		} catch (error) {
			next(error);
			console.error("Logout controller error:", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async refreshToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const token = req.cookies.refreshToken;

			if (!token) {
				return errorResponse(
					res,
					MESSAGES.AUTH.REFRESH_TOKEN_MISSING,
					HttpStatus.UNAUTHORIZED,
				);
			}

			const { accessToken } = await this._authService.refreshToken(token);

			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
			});

			return successResponse(res, MESSAGES.AUTH.REFRESH_TOKEN_SUCCESS);
		} catch (error) {
			next(error);
			console.error("Refresh token error:", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async googleAuth(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { credential } = req.body;

			if (!credential) {
				return errorResponse(
					res,
					MESSAGES.AUTH.GOOGLE_CREDENTIAL_MISSING,
					HttpStatus.BAD_REQUEST,
				);
			}

			const result = await this._authService.googleAuth(credential);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			res.cookie("accessToken", result.accessToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
				maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
			});

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
				maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
			});

			return successResponse(res, MESSAGES.AUTH.GOOGLE_LOGIN_SUCCESS, {
				user: result.user,
			});
		} catch (error) {
			next(error);
			console.error("Google Auth Controller Error:", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async exampleRoute(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const user = req.user;
			//console.log('user is the one: ',user)
			if (!user) {
				return errorResponse(
					res,
					MESSAGES.AUTH.UNAUTHORIZED,
					HttpStatus.UNAUTHORIZED,
				);
			}
			return successResponse(res, "Token verification successful", {
				user: {
					id: user.userId,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			});
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async changePassword(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { old_password, new_password } = changePasswordSchema.parse(
				req.body,
			);

			// Assume user ID is available in req.user due to auth middleware
			const user = (req as Request & { user?: { userId: string } }).user;
			if (!user || !user.userId) {
				return errorResponse(
					res,
					MESSAGES.AUTH.UNAUTHORIZED,
					HttpStatus.UNAUTHORIZED,
				);
			}

			const result = await this._authService.changePassword(
				user.userId,
				old_password,
				new_password,
			);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			return successResponse(res, result.message);
		} catch (error) {
			next(error);
			console.log("change password error: ", error);
			return errorResponse(
				res,
				MESSAGES.ERRORS.SERVER_ERROR,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
