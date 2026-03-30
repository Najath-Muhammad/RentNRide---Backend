import { Router } from "express";
import { ROUTES } from "../constants/Routes/routeConstants";
import { FileController } from "../controller/Implementation/file.controller";
import { FileService } from "../services/Implementation/file.service";

const fileRouter = Router();
const fileService = new FileService();
const fileController = new FileController(fileService);

fileRouter.post(
	ROUTES.FILE.GENERATE_UPLOAD_URL,
	fileController.generateUploadUrl.bind(fileController),
);

export default fileRouter;
