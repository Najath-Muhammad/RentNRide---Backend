import mongoose, { Schema } from "mongoose";
import type { IWallet, ITransaction } from "../types/wallet/wallet.types";

const TransactionSchema = new Schema<ITransaction>(
    {
        amount: { type: Number, required: true },
        transactionType: { type: String, enum: ["credit", "debit"], required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now }
    },
    { _id: true }
);

const WalletSchema = new Schema<IWallet>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        balance: { type: Number, default: 0 },
        transactionHistory: [TransactionSchema]
    },
    { timestamps: true }
);

export const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);
