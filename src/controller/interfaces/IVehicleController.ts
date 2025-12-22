import type { NextFunction, Request, Response } from "express";

export interface IVehicleController{
    createVehicle(req:Request,res:Response,next:NextFunction):Promise<Response>;
}