import { Router } from "express";
import { ROUTES } from "../constants/Routes/routeConstants";
import { ALL_ROLES } from "../constants/roles";
import { AuthController } from "../controller/Implementation/auth.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { AuthService } from "../services/Implementation/auth.service";

const router = Router();

const userRepository = new UserRepo();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post(ROUTES.AUTH.SIGNUP, authController.signup.bind(authController));
router.post(
	ROUTES.AUTH.VERIFY_OTP,
	authController.verifyOtp.bind(authController),
);
router.post(
	ROUTES.AUTH.RESEND_OTP,
	authController.resendOtp.bind(authController),
);
router.post(ROUTES.AUTH.LOGIN, authController.login.bind(authController));
router.post(ROUTES.AUTH.LOGOUT, authController.logout.bind(authController));

router.post(
	ROUTES.AUTH.FORGOT_PASSWORD,
	authController.verifyEmail.bind(authController),
);
router.post(
	ROUTES.AUTH.VERIFY_OTP_FORGOT,
	authController.verifyOtpFor.bind(authController),
);
router.post(
	ROUTES.AUTH.RESET_PASSWORD,
	authController.resetPassword.bind(authController),
);

router.post(ROUTES.AUTH.GOOGLE, authController.googleAuth.bind(authController));
router.post(
	ROUTES.AUTH.REFRESH_TOKEN,
	authController.refreshToken.bind(authController),
);

router.get(
	ROUTES.AUTH.ME,
	AuthGuard(ALL_ROLES),
	authController.exampleRoute.bind(authController),
);

router.patch(
	ROUTES.AUTH.CHANGE_PASSWORD,
	AuthGuard(ALL_ROLES),
	authController.changePassword.bind(authController),
);

export default router;
