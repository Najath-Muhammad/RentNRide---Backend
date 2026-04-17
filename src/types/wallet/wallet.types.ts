import type { Document, Types } from "mongoose";

export interface ITransaction {
	amount: number;
	transactionType: "credit" | "debit";
	description: string;
	date: Date;
	_id?: Types.ObjectId;
	createdAt?: Date;
}

export interface IWallet extends Document {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	balance: number;
	transactionHistory: ITransaction[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface WalletDTO {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	balance: number;
	createdAt?: Date;
	updatedAt?: Date;
	transactionHistory: TransactionDTO[];
	pagination?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface TransactionDTO {
	_id?: Types.ObjectId;
	amount: number;
	transactionType: "credit" | "debit";
	description: string;
	date: Date;
}
