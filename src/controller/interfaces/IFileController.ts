import { Request,Response } from "express";
export interface IFileController {
    generateUploadUrl(req: Request, res: Response):Promise<Response>;
}