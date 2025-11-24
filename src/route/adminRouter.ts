// src/routes/admin.routes.ts

import { Router } from "express";
import { AuthController } from "../controller/Implementation/AuthController";
import { AdminController } from "../controller/Implementation/AdminController";
import { AuthService } from "../services/Implementation/AuthServices";
import { AdminServices } from "../services/Implementation/AdminServices";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { ROUTES } from "../constants/Routes/routeConstants";
import { AuthGuard } from "../middlewares/authGuard"; 

const adminRouter = Router();


const userRepository = new UserRepo();
const authService = new AuthService(userRepository);
const adminServices = new AdminServices(userRepository);

const authController = new AuthController(authService);
const adminController = new AdminController(adminServices);



adminRouter.post(ROUTES.ADMIN.LOGIN, authController.adminLogin.bind(authController));
adminRouter.post(ROUTES.ADMIN.LOGOUT, authController.adminLogout.bind(authController));

adminRouter.get(ROUTES.ADMIN.GET_USERS, adminController.getAllUsers.bind(adminController));
adminRouter.patch(ROUTES.ADMIN.BLOCK_USER, adminController.blockUser.bind(adminController));
adminRouter.patch(ROUTES.ADMIN.UNBLOCK_USER, adminController.unblockUser.bind(adminController));
adminRouter.delete(ROUTES.ADMIN.DELETE_USER, adminController.deleteUser.bind(adminController));

export default adminRouter;