import { Router } from "express";
import { ChatController } from "../controller/Implementation/chat.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { ConversationRepo } from "../repositories/Implementation/conversation.repository";
import { MessageRepo } from "../repositories/Implementation/message.repository";
import { ChatService } from "../services/Implementation/chat.service";

const chatRouter = Router();

const conversationRepo = new ConversationRepo();
const messageRepo = new MessageRepo();
const chatService = new ChatService(messageRepo, conversationRepo);
const chatController = new ChatController(chatService);

chatRouter.use(AuthGuard(["user", "premium"]));

chatRouter.post("/conversations", chatController.getOrCreateConversation.bind(chatController));
chatRouter.get("/conversations", chatController.getConversations.bind(chatController));
chatRouter.get("/conversations/:conversationId/messages", chatController.getMessages.bind(chatController));
chatRouter.post("/messages", chatController.sendMessage.bind(chatController));
chatRouter.post("/conversations/:conversationId/booking-action", chatController.handleBookingAction.bind(chatController));

export default chatRouter;
