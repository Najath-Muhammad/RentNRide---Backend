import { success } from "zod";
import { IVehicleRepository } from "../../repositories/interfaces/vehicle.interface";
import { IVehicle } from "../../types/vehicles/IVehicle";
import { IVehicleService } from "../Interfaces/IVehicleService";


export class VehicleService implements IVehicleService{
    constructor(private _vehicleRepo:IVehicleRepository){}

    async createVehicle(VehicleData:IVehicle){
        try {
            let res = await this._vehicleRepo.create(VehicleData)
            conso
            return{success:true,message:'vehicle created successfully'}
        } catch (error) {
            return{success:false,message:'there is an error'}
        }
    }
}