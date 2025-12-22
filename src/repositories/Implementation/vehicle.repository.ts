import { Document } from "mongoose";
import { IVehicle } from "../../types/vehicles/IVehicle";
import { BaseRepo } from "./base.repository";
import { VehicleModel } from "../../model/vehicle.model";

export class VehicleRepo extends BaseRepo<Document & IVehicle>{
    constructor(){
        super(VehicleModel)
    }
}