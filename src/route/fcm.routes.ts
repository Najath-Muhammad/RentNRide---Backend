import { Router } from "express";
import { FcmController } from "../controller/Implementation/fcm.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { UserRepo } from "../repositories/Implementation/user.repository";

const fcmRouter = Router();
const userRepo = new UserRepo();
const fcmController = new FcmController(userRepo);

// All endpoints require an authenticated user
fcmRouter.use(AuthGuard(["user", "premium"]));

fcmRouter.post("/token", fcmController.registerToken.bind(fcmController));
fcmRouter.delete("/token", fcmController.removeToken.bind(fcmController));

export default fcmRouter;
