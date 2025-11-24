import { Router } from "express";
import { AuthController } from "../controller/Implementation/AuthController";
import { AuthService } from "../services/Implementation/AuthServices";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { AuthGuard } from "../middlewares/authGuard";
import {ROUTES} from '../constants/Routes/routeConstants'

const router = Router();

const userRepository = new UserRepo();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post(ROUTES.AUTH.SIGNUP, authController.signup.bind(authController));
router.post(ROUTES.AUTH.VERIFY_OTP, authController.verifyOtp.bind(authController));
router.post(ROUTES.AUTH.RESEND_OTP, authController.resendOtp.bind(authController));
router.post(ROUTES.AUTH.LOGIN, authController.login.bind(authController));
router.post(ROUTES.AUTH.LOGOUT, authController.logout.bind(authController));

router.post(ROUTES.AUTH.FORGOT_PASSWORD, authController.verifyEmail.bind(authController));
router.post(ROUTES.AUTH.VERIFY_OTP_FORGOT, authController.verifyOtpFor.bind(authController));
router.post(ROUTES.AUTH.RESET_PASSWORD, authController.resetPassword.bind(authController));

router.post(ROUTES.AUTH.GOOGLE, authController.googleAuth.bind(authController));
router.post(ROUTES.AUTH.REFRESH_TOKEN, authController.refreshToken.bind(authController));

router.get(ROUTES.AUTH.ME, AuthGuard(["user", "admin"]), authController.exampleRoute.bind(authController));

export default router;