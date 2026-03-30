import { Router } from "express";
import { ChatController } from "../controller/Implementation/chat.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { checkBlocked } from "../middlewares/checkBlocked";
import { ConversationRepo } from "../repositories/Implementation/conversation.repository";
import { MessageRepo } from "../repositories/Implementation/message.repository";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { AuthService } from "../services/Implementation/auth.service";
import { ChatService } from "../services/Implementation/chat.service";

const chatRouter = Router();

const messageRepo = new MessageRepo();
const conversationRepo = new ConversationRepo();
const userRepo = new UserRepo();

const chatService = new ChatService(messageRepo, conversationRepo);
const authService = new AuthService(userRepo);
const chatController = new ChatController(chatService);

const guard = AuthGuard(["user", "premium", "admin"]);
const blocked = checkBlocked(authService);


chatRouter.get(
    "/conversations",
    guard,
    blocked,
    chatController.getConversations.bind(chatController),
);

// POST /api/chat/conversations – get or create a conversation
chatRouter.post(
    "/conversations",
    guard,
    blocked,
    chatController.getOrCreateConversation.bind(chatController),
);

// GET /api/chat/conversations/:conversationId/messages – paginated message history
chatRouter.get(
    "/conversations/:conversationId/messages",
    guard,
    blocked,
    chatController.getMessages.bind(chatController),
);

// POST /api/chat/messages – send a text message (HTTP fallback for socket)
chatRouter.post(
    "/messages",
    guard,
    blocked,
    chatController.sendMessage.bind(chatController),
);

// PATCH /api/chat/conversations/:conversationId/booking-action – owner approve/reject
chatRouter.patch(
    "/conversations/:conversationId/booking-action",
    guard,
    blocked,
    chatController.handleBookingAction.bind(chatController),
);

export default chatRouter;
