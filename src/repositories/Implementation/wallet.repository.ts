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

	async findPaginatedTransactions(
		userId: string | Types.ObjectId,
		page: number,
		limit: number,
	): Promise<{ transactions: ITransaction[]; total: number }> {
		const skip = (page - 1) * limit;

		const result = await this.model.aggregate([
			{
				$match: {
					userId:
						typeof userId === "string"
							? new this.model.base.Types.ObjectId(userId)
							: userId,
				},
			},
			{
				$project: {
					total: { $size: "$transactionHistory" },
					transactions: { $slice: ["$transactionHistory", skip, limit] },
				},
			},
		]);

		if (!result || result.length === 0) {
			return { transactions: [], total: 0 };
		}

		return {
			transactions: result[0].transactions,
			total: result[0].total,
		};
	}
}
