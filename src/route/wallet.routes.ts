import { Router } from "express";
import { ALL_ROLES } from "../constants/roles";
import { WalletController } from "../controller/Implementation/wallet.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { WalletRepo } from "../repositories/Implementation/wallet.repository";
import { WalletService } from "../services/Implementation/wallet.service";

const router = Router();
const walletRepo = new WalletRepo();
export const walletService = new WalletService(walletRepo); // export so payment.service can use it for webhook
const walletController = new WalletController(walletService);

router.use(AuthGuard(ALL_ROLES));

router.get("/", walletController.getWallet.bind(walletController));
router.post(
	"/fund-intent",
	walletController.createWalletFundingIntent.bind(walletController),
);
router.post(
	"/verify-funding",
	walletController.verifyWalletFunding.bind(walletController),
);

export default router;
