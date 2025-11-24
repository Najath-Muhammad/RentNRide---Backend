import { Request, Response } from 'express';
import { AuthService } from '../../services/Implementation/AuthServices';
import { IAuthController } from '../interfaces/IAuthController';
import { IAuthService } from '../../services/Interfaces/IAuthServices';
import { loginSchema, resetPassword, signupSchema, verifyEmailSchema, verifyOtpSchema } from '../../validations/authVallidatoin';
import { HttpStatus } from '../../constants/enum/StatusCode';
import { MESSAGES } from '../../constants/messages/messageConstants';

export class AuthController implements IAuthController {
   constructor(private _authService: IAuthService) { }

   async signup(req: Request, res: Response): Promise<Response> {
      try {
         const validated = signupSchema.parse(req.body);
         const { name, email, password } = validated;

         const result = await this._authService.signup({ name, email, password });

         return res.status(HttpStatus.OK).json(result);

      } catch (error: any) {
         console.error("Signup controller error:", error);

         const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
         const message = error.message || MESSAGES.ERRORS.SERVER_ERROR;

         return res.status(statusCode).json({
            success: false,
            message
         });
      }
   }

   async verifyEmail(req: Request, res: Response) {
      try {
         const { email } = verifyEmailSchema.parse(req.body);

         const response = await this._authService.verifyEmail(email);
         return res.status(HttpStatus.OK).json({
            success: response?.success ?? true,
            message: response?.message ?? MESSAGES.AUTH.OTP_SENT
         });

      } catch (error: any) {
         return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message || MESSAGES.AUTH.EMAIL_REQUIRED
         });
      }
   }

   async verifyOtp(req: Request, res: Response): Promise<Response> {
      try {
         const { otp, email } = verifyOtpSchema.parse(req.body);

         const result = await this._authService.verifyOtp(otp, email);

         res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
         });

         res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });

         return res.status(HttpStatus.OK).json({
            success: true,
            message: result.message || MESSAGES.AUTH.OTP_VERIFIED,
            user: result.user
         });

      } catch (error: any) {
         console.error("Verify OTP controller error:", error);
         return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message || MESSAGES.ERRORS.VALIDATION_ERROR
         });
      }
   }

   async verifyOtpFor(req: Request, res: Response) {
      try {
         const { otp, email } = verifyOtpSchema.parse(req.body);

         const result = await this._authService.verifyOtpFor(otp, email);
         return res.status(HttpStatus.OK).json({
            success: true,
            message: result.message || MESSAGES.AUTH.OTP_VERIFIED
         });
      } catch (error: any) {
         return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message || MESSAGES.AUTH.OTP_EMAIL_REQUIRED
         });
      }
   }

   async resetPassword(req: Request, res: Response): Promise<Response> {
      try {
         const { email, new_password } = resetPassword.parse(req.body);
         const password = new_password;

         const result = await this._authService.resetPassword(email, password);

         return res.status(HttpStatus.OK).json({
            success: true,
            message: result?.message || MESSAGES.AUTH.PASSWORD_RESET
         });

      } catch (error: any) {
         console.error("Reset Password controller error:", error);

         const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
         const message = error.message || MESSAGES.ERRORS.SERVER_ERROR;

         return res.status(statusCode).json({
            success: false,
            message
         });
      }
   }

   async resendOtp(req: Request, res: Response): Promise<Response> {
      try {
         const { email } = verifyEmailSchema.parse(req.body);

         const result = await this._authService.resendOtp(email);

         return res.status(HttpStatus.OK).json(result);

      } catch (error: any) {
         console.error("Resend OTP controller error:", error);

         return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message || MESSAGES.AUTH.EMAIL_REQUIRED
         });
      }
   }

   async login(req: Request, res: Response): Promise<Response> {
      try {
         const { email, password } = loginSchema.parse(req.body);

         const result = await this._authService.login(email, password);

         if (!result.success) {
            return res.status(HttpStatus.OK).json({ success: false, message: result.message });
         }

         res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
         });

         res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.LOGIN_SUCCESS
         });

      } catch (error: any) {
         console.log('Login Error', error);
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async logout(req: Request, res: Response): Promise<Response> {
      try {
         const isProduction = process.env.NODE_ENV === "production";

         const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ("none" as const) : ("lax" as const),
         };
         res.clearCookie("accessToken", cookieOptions);
         res.clearCookie("refreshToken", cookieOptions);

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.LOGOUT_SUCCESS
         });

      } catch (error: any) {
         console.error("Logout controller error:", error);
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async adminLogin(req: Request, res: Response): Promise<Response> {
      try {
         const { email, password } = loginSchema.parse(req.body);

         const result = await this._authService.adminLogin(email, password);

         if (!result.success) {
            return res.status(HttpStatus.OK).json({ success: false, message: result.message });
         }

         res.cookie("admin_accessToken", result.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
         });

         res.cookie("admin_refreshToken", result.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.LOGIN_SUCCESS
         });

      } catch (error) {
         console.log('Admin Login Error', error);
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async adminLogout(req: Request, res: Response): Promise<Response> {
      try {
         const isProduction = process.env.NODE_ENV === "production";

         const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ("none" as const) : ("lax" as const),
         };
         res.clearCookie("admin_accessToken", cookieOptions);
         res.clearCookie("admin_refreshToken", cookieOptions);

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.LOGOUT_SUCCESS
         });

      } catch (error: any) {
         console.error("Logout controller error:", error);
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async refreshToken(req: Request, res: Response): Promise<Response> {
      try {
         const token = req.cookies.refreshToken;

         if (!token) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
               success: false,
               message: MESSAGES.AUTH.REFRESH_TOKEN_MISSING
            });
         }

         const { accessToken } = await this._authService.refreshToken(token);

         res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
         });

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.REFRESH_TOKEN_SUCCESS
         });

      } catch (error: any) {
         console.error("Refresh token error:", error);
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async googleAuth(req: Request, res: Response): Promise<Response> {
      try {
         const { credential } = req.body;

         if (!credential) {
            return res.status(HttpStatus.BAD_REQUEST).json({
               success: false,
               message: MESSAGES.AUTH.GOOGLE_CREDENTIAL_MISSING
            });
         }

         const result = await this._authService.googleAuth(credential);

         if (!result.success) {
            return res.status(HttpStatus.BAD_REQUEST).json({
               success: false,
               message: result.message
            });
         }

         res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000
         });

         res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
         });

         return res.status(HttpStatus.OK).json({
            success: true,
            message: MESSAGES.AUTH.GOOGLE_LOGIN_SUCCESS,
            user: result.user
         });

      } catch (error: any) {
         console.error("Google Auth Controller Error:", error);
         return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message || MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }

   async exampleRoute(req: Request, res: Response): Promise<Response> {
      try {
         const user = (req as any).user;
         //console.log('user is the one: ',user)
         if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
               success: false,
               message: MESSAGES.AUTH.UNAUTHORIZED
            });
         }
         return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Token verification successful',
            user: {
               id: user.userId,
               email: user.email,
               role: user.role
            }
         });
      } catch (error) {
         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERRORS.SERVER_ERROR
         });
      }
   }
}