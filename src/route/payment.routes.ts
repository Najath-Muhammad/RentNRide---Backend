import express, { Router } from "express";
import { PaymentController } from "../controller/Implementation/payment.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { BookingRepo } from "../repositories/Implementation/booking.repository";
import { PaymentService } from "../services/Implementation/payment.service";

const router = Router();
const bookingRepo = new BookingRepo();
const paymentService = new PaymentService(bookingRepo);
const paymentController = new PaymentController(paymentService);

router.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	paymentController.handleWebhook.bind(paymentController),
);

router.use(AuthGuard(["user", "premium", "admin"]));
router.post(
	"/advance-payment",
	paymentController.createAdvancePaymentIntent.bind(paymentController),
);
router.post(
	"/verify",
	paymentController.verifyAdvancePayment.bind(paymentController),
);
router.post(
	"/capture",
	paymentController.capturePayment.bind(paymentController),
);
router.post(
	"/cancel-intent",
	paymentController.cancelPaymentIntent.bind(paymentController),
);

export default router;
