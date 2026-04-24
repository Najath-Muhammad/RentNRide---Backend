import { Router } from "express";
import { ROUTES } from "../constants/Routes/routeConstants";
import { ALL_ROLES } from "../constants/roles";
import { VehicleController } from "../controller/Implementation/vehicle.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { SoftAuth } from "../middlewares/softAuth";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";
import { VehicleService } from "../services/Implementation/vehicle.service";

const vehicleRouter = Router();

const vehicleRepo = new VehicleRepo();
const vehicleService = new VehicleService(vehicleRepo);
const vehicleController = new VehicleController(vehicleService);

vehicleRouter.post(
	ROUTES.VEHICLE.CREATE_VEHICLE,
	AuthGuard(ALL_ROLES),
	vehicleController.createVehicle.bind(vehicleController),
);
vehicleRouter.get(
	ROUTES.VEHICLE.MY_VEHICLES,
	AuthGuard(ALL_ROLES),
	vehicleController.getMyVehicles.bind(vehicleController),
);
vehicleRouter.get(
	ROUTES.VEHICLE.GET_PUBLIC_VEHICLES,
	SoftAuth,
	vehicleController.getPublicVehicles.bind(vehicleController),
);
vehicleRouter.get(
	ROUTES.VEHICLE.GET_VEHICLE_BY_ID,
	SoftAuth,
	vehicleController.getVehicleById.bind(vehicleController),
);
vehicleRouter.patch(
	ROUTES.VEHICLE.UPDATE_VEHICLE,
	AuthGuard(ALL_ROLES),
	vehicleController.updateVehicle.bind(vehicleController),
);
vehicleRouter.delete(
	ROUTES.VEHICLE.DELETE_VEHICLE,
	AuthGuard(ALL_ROLES),
	vehicleController.deleteVehicle.bind(vehicleController),
);

export default vehicleRouter;
