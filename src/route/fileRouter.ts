import { Router } from 'express';
import { FileController } from '../controller/Implementation/FileController';
import { FileService } from '../services/Implementation/FileService';

const fileRouter = Router()
const fileService = new FileService()
const fileController = new FileController(fileService)

fileRouter.post('/generate-upload-url', fileController.generateUploadUrl.bind(fileController))

export default fileRouter