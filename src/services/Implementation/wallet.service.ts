import type { Types } from "mongoose";
import { stripe } from "../../config/stripe.config";
import type { IWalletRepo } from "../../repositories/interfaces/wallet.interface";
import type { IWalletService } from "../Interfaces/wallet.interface.service";
import type { IWallet, ITransaction } from "../../types/wallet/wallet.types";

export class WalletService implements IWalletService {
    constructor(private _walletRepo: IWalletRepo) { }

    async getWallet(userId: string | Types.ObjectId): Promise<IWallet> {
        let wallet = await this._walletRepo.findByUserId(userId);
        if (!wallet) {
            wallet = await this._walletRepo.createWallet(userId);
        }
        return wallet;
    }

    async addTransaction(userId: string | Types.ObjectId, amount: number, type: "credit" | "debit", description: string): Promise<IWallet> {
        let wallet = await this.getWallet(userId);

        const newBalance = type === "credit" ? wallet.balance + amount : wallet.balance - amount;

        if (newBalance < 0) {
            throw new Error("Insufficient wallet balance");
        }

        const transaction: ITransaction = {
            amount,
            transactionType: type,
            description,
            date: new Date()
        };

        const updatedWallet = await this._walletRepo.addTransaction(wallet._id as any, transaction, newBalance);
        if (!updatedWallet) {
            throw new Error("Failed to update wallet");
        }

        return updatedWallet;
    }

    async createWalletFundingIntent(userId: string | Types.ObjectId, amount: number): Promise<{ clientSecret: string; amount: number }> {
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
                amount: amount.toString()
            },
        });

        return {
            clientSecret: paymentIntent.client_secret as string,
            amount,
        };
    }
}
