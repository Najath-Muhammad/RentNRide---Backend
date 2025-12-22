import { Request, Response, NextFunction } from "express";
import { IVehicleController } from "../interfaces/IVehicleController";
import { IVehicleService } from "../../services/Interfaces/IVehicleService";
import { HttpStatus } from "../../constants/enum/StatusCode";
import { success } from "zod";




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
            
            return res.status(HttpStatus.OK).json({success:true,message:'Vehicle Created Successfully, Waiting for admins Approval'})
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:error})
        }
    }
}