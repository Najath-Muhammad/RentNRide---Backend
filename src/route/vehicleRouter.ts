import {Router} from "express";
import { VehicleController } from "../controller/Implementation/VehicleController";
import { VehicleService } from "../services/Implementation/VehicleService";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";
import { AuthGuard } from "../middlewares/authGuard";


const vehicleRouter = Router()

const vehicleRepo = new VehicleRepo()
const vehicleService = new VehicleService(vehicleRepo)
const vehicleController = new VehicleController(vehicleService)

vehicleRouter.post('/createVehicle',AuthGuard(["user", "admin"]),vehicleController.createVehicle.bind(vehicleController))

export default vehicleRouter;