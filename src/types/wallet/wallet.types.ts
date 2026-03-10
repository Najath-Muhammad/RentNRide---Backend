import type { Types, Document } from "mongoose";

export interface ITransaction {
    amount: number;
    transactionType: "credit" | "debit";
    description: string;
    date: Date;
    _id?: Types.ObjectId;
}

export interface IWallet extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    balance: number;
    transactionHistory: ITransaction[];
}
