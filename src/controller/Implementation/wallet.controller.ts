import type { Request, Response } from "express";
import type { IWalletService } from "../../services/Interfaces/wallet.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { HttpStatus } from "../../constants/enum/statuscode";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class WalletController {
    constructor(private _walletService: IWalletService) { }

    async getWallet(req: Request, res: Response) {
        try {
            const { userId } = (req as AuthRequest).user!;
            const wallet = await this._walletService.getWallet(userId);
            successResponse(res, "Wallet retrieved successfully", wallet);
        } catch (error) {
            errorResponse(res, (error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createWalletFundingIntent(req: Request, res: Response) {
        try {
            const { userId } = (req as AuthRequest).user!;
            const { amount } = req.body;

            if (!amount || amount < 10) {
                errorResponse(res, "Invalid amount. Must be at least ₹10.", HttpStatus.BAD_REQUEST);
                return;
            }

            const intent = await this._walletService.createWalletFundingIntent(userId, amount);
            successResponse(res, "Payment intent created successfully", intent);
        } catch (error) {
            errorResponse(res, (error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
