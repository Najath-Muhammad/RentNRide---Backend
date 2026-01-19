import { Router } from "express";
import { ROUTES } from "../constants/Routes/routeConstants";
import { AdminController } from "../controller/Implementation/admin.controller";
import { AdminVehicleController } from "../controller/Implementation/admin.vehicle.controller";
import { AuthController } from "../controller/Implementation/auth.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";
import { AdminServices } from "../services/Implementation/admin.service";
import { AuthService } from "../services/Implementation/auth.service";
import { VehicleService } from "../services/Implementation/vehicle.service";

const adminRouter = Router();

const userRepository = new UserRepo();
const authService = new AuthService(userRepository);
const adminServices = new AdminServices(userRepository);

const authController = new AuthController(authService);
const adminController = new AdminController(adminServices);

const vehicleRepo = new VehicleRepo();
const vehicleService = new VehicleService(vehicleRepo);
const adminVehicleController = new AdminVehicleController(vehicleService);

//auth
adminRouter.post(
	ROUTES.ADMIN.LOGIN,
	authController.adminLogin.bind(authController),
);
adminRouter.post(
	ROUTES.ADMIN.LOGOUT,
	authController.adminLogout.bind(authController),
);

//user management
adminRouter.get(
	ROUTES.ADMIN.GET_USERS,
	adminController.getAllUsers.bind(adminController),
);
adminRouter.patch(
	ROUTES.ADMIN.BLOCK_USER,
	adminController.blockUser.bind(adminController),
);
adminRouter.patch(
	ROUTES.ADMIN.UNBLOCK_USER,
	adminController.unblockUser.bind(adminController),
);
adminRouter.delete(
	ROUTES.ADMIN.DELETE_USER,
	adminController.deleteUser.bind(adminController),
);

//vehicle management
adminRouter.get(
	ROUTES.ADMIN.GET_VEHICLES,
	adminVehicleController.getAllVehicles.bind(adminVehicleController),
);
adminRouter.get(
	ROUTES.ADMIN.GET_VEHICLE_STATS,
	adminVehicleController.getVehicleStats.bind(adminVehicleController),
);
adminRouter.patch(
	ROUTES.ADMIN.APPROVE_VEHICLE,
	adminVehicleController.approveVehicle.bind(adminVehicleController),
);
adminRouter.patch(
	ROUTES.ADMIN.BLOCK_VEHICLE,
	adminVehicleController.blockVehicle.bind(adminVehicleController),
);
adminRouter.patch(
	ROUTES.ADMIN.UNBLOCK_VEHICLE,
	adminVehicleController.unblockVehicle.bind(adminVehicleController),
);
adminRouter.get(
	ROUTES.ADMIN.GET_VEHICLE_BY_ID,
	adminVehicleController.getVehicleById.bind(adminVehicleController),
);
adminRouter.patch(
	ROUTES.ADMIN.REJECT_VEHICLE,
	AuthGuard(["admin"]),
	adminVehicleController.rejectVehicle.bind(adminVehicleController),
);

export default adminRouter;
