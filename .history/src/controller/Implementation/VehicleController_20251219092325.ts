import { Request, Response, NextFunction } from "express";
import { IVehicleController } from "../interfaces/IVehicleController";




export class VehicleController implements IVehicleController{

    async createVehicle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            
            const user = (req as any).user
            const VehicleData = req.body
            const response = awati

        } catch (error) {
            
        }
    }
}