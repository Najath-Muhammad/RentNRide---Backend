import { Request, Response, NextFunction } from "express";
import { IVehicleController } from "../interfaces/IVehicleController";




export class VehicleController implements IVehicleController{
    constructor(private _vehicle)

    async createVehicle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            
            const user = (req as any).user
            const VehicleData = req.body
            const response = await 

        } catch (error) {
            
        }
    }
}