import { Request, Response, NextFunction } from "express";
import { IVehicleController } from "../interfaces/IVehicleController";
import { IVehicleService } from "../../services/Interfaces/IVehicleService";
import { HttpStatus } from "../../constants/enum/StatusCode";




export class VehicleController implements IVehicleController{
    constructor(private _vehicleServie:IVehicleService){}

    async createVehicle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            
            const user = (req as any).user
            const VehicleData = req.body
            const response = await this._vehicleServie.createVehicle({
                ownerId:user.id,
                ...VehicleData
            })
        
            return res.status(HttpStatus.OK).json({succe})
        } catch (error) {
            
        }
    }
}