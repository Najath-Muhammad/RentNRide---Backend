import type { Types } from "mongoose";
import { WalletModel } from "../../model/wallet.model";
import type { ITransaction, IWallet } from "../../types/wallet/wallet.types";
import type { IWalletRepo } from "../interfaces/wallet.interface";
import { BaseRepo } from "./base.repository";

export class WalletRepo extends BaseRepo<IWallet> implements IWalletRepo {
	constructor() {
		super(WalletModel);
	}

	async findByUserId(userId: string | Types.ObjectId): Promise<IWallet | null> {
		return await this.model.findOne({ userId }).exec();
	}

	async createWallet(userId: string | Types.ObjectId): Promise<IWallet> {
		const wallet = new this.model({
			userId,
			balance: 0,
			transactionHistory: [],
		});
		return await wallet.save();
	}

	async addTransaction(
		walletId: string | Types.ObjectId,
		transaction: ITransaction,
		newBalance: number,
	): Promise<IWallet | null> {
		return await this.model
			.findByIdAndUpdate(
				walletId,
				{
					$set: { balance: newBalance },
					$push: { transactionHistory: { $each: [transaction], $position: 0 } },
				},
				{ new: true },
			)
			.exec();
	}
}
