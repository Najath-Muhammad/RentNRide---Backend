import type {
	ITransaction,
	IWallet,
	TransactionDTO,
	WalletDTO,
} from "../../types/wallet/wallet.types";

export const walletDTO = (wallet: IWallet): WalletDTO => {
	return {
		_id: wallet._id,
		userId: wallet.userId,
		balance: wallet.balance,
		createdAt: wallet.createdAt,
		updatedAt: wallet.updatedAt,
		transactionHistory: wallet.transactionHistory
			? wallet.transactionHistory.map((t) => walletTransactionDTO(t))
			: [],
	};
};

export const walletTransactionDTO = (
	transaction: ITransaction,
): TransactionDTO => {
	return {
		_id: transaction._id,
		amount: transaction.amount,
		transactionType: transaction.transactionType,
		description: transaction.description,
		date: transaction.date || transaction.createdAt,
	};
};
