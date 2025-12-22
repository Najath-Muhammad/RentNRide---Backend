import { IVehicleRepository } from "../../repositories/interfaces/vehicle.interface";
import { IVehicle } from "../../types/vehicles/IVehicle";
import { IVehicleService } from "../Interfaces/IVehicleService";


export class VehicleService implements IVehicleService{
    constructor(private _vehicleRepo:IVehicleRepository){}

    async createVehicle(VehicleData:IVehicle){
        try {
            let res = await this._vehicleRepo.create(VehicleData)
            return{sun}
        } catch (error) {
            
        }
    }
}