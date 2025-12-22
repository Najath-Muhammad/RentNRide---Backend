import {Router} from "express";
import { VehicleController } from "../controller/Implementation/VehicleController";
import { VehicleService } from "../services/Implementation/VehicleService";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";


const router = Router()

const vehicleRepo = new VehicleRepo()
const vehicleService = new VehicleService(vehicleRepo)
co
