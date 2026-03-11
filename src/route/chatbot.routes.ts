import { Router } from "express";
import { ChatbotController } from "../controller/Implementation/chatbot.controller";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";
import { VehicleService } from "../services/Implementation/vehicle.service";

const chatbotRouter = Router();

const vehicleRepo = new VehicleRepo();
const vehicleService = new VehicleService(vehicleRepo);
const chatbotController = new ChatbotController(vehicleService);

chatbotRouter.post("/", chatbotController.handleChat.bind(chatbotController));

export default chatbotRouter;
