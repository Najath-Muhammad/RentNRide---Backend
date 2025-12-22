import { IVehicle } from "../../types/vehicles/IVehicle";


export interface IVehicleService{
    createVehicle(VehicleData:IVehicle):Promise<{success:boolean,message:stir}>;
}