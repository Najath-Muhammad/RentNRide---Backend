import type { Request, Response } from "express";

export interface IChatController {
    getOrCreateConversation(req: Request, res: Response): Promise<void>;
    getConversations(req: Request, res: Response): Promise<void>;
    getMessages(req: Request, res: Response): Promise<void>;
    sendMessage(req: Request, res: Response): Promise<void>;
    handleBookingAction(req: Request, res: Response): Promise<void>;
}
