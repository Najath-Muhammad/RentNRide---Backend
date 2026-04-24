import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IWalletService } from "../../services/interfaces/wallet.interface.service";
import type { ITransaction } from "../../types/wallet/wallet.types";
import {
	walletDTO,
	walletTransactionDTO,
} from "../../utils/mapper/wallet.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	fundWalletSchema,
	verifyPaymentIntentSchema,
} from "../../validations/commonValidation";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class WalletController {
	constructor(private _walletService: IWalletService) {}

	async getWallet(req: Request, res: Response) {
		try {
			const { userId } = (req as AuthRequest).user as { userId: string };
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 5;

			const wallet = await this._walletService.getWallet(userId);
			const paginated = await this._walletService.getPaginatedTransactions(
				userId,
				page,
				limit,
			);

			const dto = wallet ? walletDTO(wallet) : null;
			if (dto) {
				dto.transactionHistory = paginated.data.map((t: ITransaction) =>
					walletTransactionDTO(t),
				);
				dto.pagination = {
					total: paginated.total,
					page: paginated.page,
					limit: paginated.limit,
					totalPages: paginated.totalPages,
				};
			}

			successResponse(res, "Wallet retrieved successfully", dto);
		} catch (error) {
			errorResponse(
				res,
				(error as Error).message,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createWalletFundingIntent(req: Request, res: Response) {
		try {
			const { userId } = (req as AuthRequest).user as { userId: string };
			const parsed = fundWalletSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const { amount } = parsed.data;

			const intent = await this._walletService.createWalletFundingIntent(
				userId,
				amount,
			);
			successResponse(res, "Payment intent created successfully", intent);
		} catch (error) {
			errorResponse(
				res,
				(error as Error).message,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async verifyWalletFunding(req: Request, res: Response) {
		try {
			const parsed = verifyPaymentIntentSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const { paymentIntentId } = parsed.data;

			const result =
				await this._walletService.verifyWalletFunding(paymentIntentId);
			successResponse(res, "Verification completed", result);
		} catch (error) {
			errorResponse(
				res,
				(error as Error).message,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
