import type { Types } from "mongoose";
import type { IWallet } from "../../types/wallet/wallet.types";

export interface IWalletService {
	getWallet(userId: string | Types.ObjectId): Promise<IWallet>;
	addTransaction(
		userId: string | Types.ObjectId,
		amount: number,
		type: "credit" | "debit",
		description: string,
	): Promise<IWallet>;
	createWalletFundingIntent(
		userId: string | Types.ObjectId,
		amount: number,
	): Promise<{ clientSecret: string; amount: number }>;
	verifyWalletFunding(
		paymentIntentId: string,
	): Promise<{ success: boolean; message: string }>;
}
