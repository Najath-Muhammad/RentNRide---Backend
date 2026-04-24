import type { Types } from "mongoose";
import { stripe } from "../../config/stripe.config";
import type { IWalletRepo } from "../../repositories/interfaces/wallet.interface";
import type { ITransaction, IWallet } from "../../types/wallet/wallet.types";
import type { IWalletService } from "../interfaces/wallet.interface.service";

export class WalletService implements IWalletService {
	constructor(private _walletRepo: IWalletRepo) {}

	async getWallet(userId: string | Types.ObjectId): Promise<IWallet> {
		let wallet = await this._walletRepo.findByUserId(userId);
		if (!wallet) {
			wallet = await this._walletRepo.createWallet(userId);
		}
		return wallet;
	}

	async addTransaction(
		userId: string | Types.ObjectId,
		amount: number,
		type: "credit" | "debit",
		description: string,
	): Promise<IWallet> {
		const wallet = await this.getWallet(userId);

		const newBalance =
			type === "credit" ? wallet.balance + amount : wallet.balance - amount;

		if (newBalance < 0) {
			throw new Error("Insufficient wallet balance");
		}

		const transaction: ITransaction = {
			amount,
			transactionType: type,
			description,
			date: new Date(),
		};

		const updatedWallet = await this._walletRepo.addTransaction(
			wallet._id as Types.ObjectId,
			transaction,
			newBalance,
		);
		if (!updatedWallet) {
			throw new Error("Failed to update wallet");
		}

		return updatedWallet;
	}

	async createWalletFundingIntent(
		userId: string | Types.ObjectId,
		amount: number,
	): Promise<{ clientSecret: string; amount: number }> {
		if (amount < 10) {
			throw new Error("Amount must be at least ₹10");
		}

		const amountInSmallestUnit = Math.round(amount * 100);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInSmallestUnit,
			currency: "inr",
			metadata: {
				purpose: "wallet_funding",
				userId: userId.toString(),
				amount: amount.toString(),
			},
		});

		return {
			clientSecret: paymentIntent.client_secret as string,
			amount,
		};
	}

	async verifyWalletFunding(
		paymentIntentId: string,
	): Promise<{ success: boolean; message: string }> {
		const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (
			intent.status === "succeeded" &&
			intent.metadata.purpose === "wallet_funding"
		) {
			const userId = intent.metadata.userId;
			const amount = Number.parseFloat(intent.metadata.amount);

			if (userId && amount) {
				if (intent.metadata.processedLocally === "true") {
					return { success: true, message: "Already processed" };
				}

				await this.addTransaction(
					userId,
					amount,
					"credit",
					"Wallet Top-up via Stripe",
				);

				await stripe.paymentIntents.update(paymentIntentId, {
					metadata: { ...intent.metadata, processedLocally: "true" },
				});

				return { success: true, message: "Wallet funded successfully" };
			}
		}
		return {
			success: false,
			message: "Payment not successful or incorrect purpose",
		};
	}

	async getPaginatedTransactions(
		userId: string | Types.ObjectId,
		page: number,
		limit: number,
	): Promise<{
		data: ITransaction[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const { transactions, total } =
			await this._walletRepo.findPaginatedTransactions(userId, page, limit);

		return {
			data: transactions,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}
}
