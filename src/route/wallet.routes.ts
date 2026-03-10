import { Router } from "express";
import { WalletController } from "../controller/Implementation/wallet.controller";
import { WalletService } from "../services/Implementation/wallet.service";
import { WalletRepo } from "../repositories/Implementation/wallet.repository";
import { AuthGuard } from "../middlewares/authGuard";

const router = Router();
const walletRepo = new WalletRepo();
export const walletService = new WalletService(walletRepo); // export so payment.service can use it for webhook
const walletController = new WalletController(walletService);

router.use(AuthGuard(["user", "premium", "admin"]));

router.get("/", walletController.getWallet.bind(walletController));
router.post("/fund-intent", walletController.createWalletFundingIntent.bind(walletController));

export default router;
