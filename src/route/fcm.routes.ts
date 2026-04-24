import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import { FcmController } from "../controller/Implementation/fcm.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { UserRepo } from "../repositories/Implementation/user.repository";

const fcmRouter = Router();
const userRepo = new UserRepo();
const fcmController = new FcmController(userRepo);

fcmRouter.use(AuthGuard(USER_ROLES));

fcmRouter.post("/token", fcmController.registerToken.bind(fcmController));
fcmRouter.delete("/token", fcmController.removeToken.bind(fcmController));

export default fcmRouter;
