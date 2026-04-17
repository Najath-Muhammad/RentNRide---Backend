import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import { UserController } from "../controller/Implementation/user.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { UserService } from "../services/Implementation/user.service";

const userRouter = Router();
const userRepo = new UserRepo();
const userService = new UserService(userRepo);
const userController = new UserController(userService);

userRouter.use(AuthGuard(USER_ROLES));

userRouter.get("/profile", userController.getProfile.bind(userController));
userRouter.patch("/profile", userController.updateProfile.bind(userController));
userRouter.patch(
	"/profile/photo",
	userController.updateProfilePhoto.bind(userController),
);

userRouter.get(
	"/subscription",
	userController.getSubscription.bind(userController),
);
userRouter.post(
	"/subscription/upgrade",
	userController.upgradePremium.bind(userController),
);

userRouter.post(
	"/profile/change-password",
	userController.changePassword.bind(userController),
);

export default userRouter;
