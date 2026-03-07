import type { Request, Response } from "express";
import type { IPaymentService } from "../../services/Interfaces/payment.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { HttpStatus } from "../../constants/enum/statuscode";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class PaymentController {
    constructor(private _paymentService: IPaymentService) { }

    async createAdvancePaymentIntent(req: Request, res: Response) {
        try {
            const { bookingId } = req.body;
            const { userId } = (req as AuthRequest).user!;

            if (!bookingId) {
                errorResponse(res, "Booking ID is required", HttpStatus.BAD_REQUEST);
                return;
            }

            const result = await this._paymentService.createAdvancePaymentIntent(bookingId, userId);
            successResponse(res, "Payment intent created successfully", result);
        } catch (error) {
            errorResponse(res, (error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async capturePayment(req: Request, res: Response) {
        try {
            const { bookingId } = req.body;

            if (!bookingId) {
                errorResponse(res, "Booking ID is required", HttpStatus.BAD_REQUEST);
                return;
            }

            const result = await this._paymentService.capturePayment(bookingId);
            successResponse(res, "Payment captured successfully", result);
        } catch (error) {
            errorResponse(res, (error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelPaymentIntent(req: Request, res: Response) {
        try {
            const { bookingId } = req.body;

            if (!bookingId) {
                errorResponse(res, "Booking ID is required", HttpStatus.BAD_REQUEST);
                return;
            }

            const result = await this._paymentService.cancelPaymentIntent(bookingId);
            successResponse(res, "Payment cancelled successfully", result);
        } catch (error) {
            errorResponse(res, (error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async handleWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers["stripe-signature"] as string;
            await this._paymentService.handleWebhook(req.body, signature);
            res.json({ received: true });
        } catch (error) {
            console.error("Webhook Error in Controller:", error);
            res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${(error as Error).message}`);
        }
    }
}
