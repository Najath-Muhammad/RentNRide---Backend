import type { Types } from "mongoose";
import type { IWallet, ITransaction } from "../../types/wallet/wallet.types";
import type { IBaseRepo } from "./base.interface";

export interface IWalletRepo extends IBaseRepo<IWallet> {
    findByUserId(userId: string | Types.ObjectId): Promise<IWallet | null>;
    createWallet(userId: string | Types.ObjectId): Promise<IWallet>;
    addTransaction(walletId: string | Types.ObjectId, transaction: ITransaction, newBalance: number): Promise<IWallet | null>;
}
