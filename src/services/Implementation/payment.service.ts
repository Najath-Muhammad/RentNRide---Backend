import type { Types } from "mongoose";
import { stripe } from "../../config/stripe.config";
import type { IBookingRepo } from "../../repositories/interfaces/booking.interface";
import type { IPaymentService } from "../Interfaces/payment.interface.service";
import { WalletRepo } from "../../repositories/Implementation/wallet.repository";
import { WalletService } from "./wallet.service";

export class PaymentService implements IPaymentService {
    constructor(private _bookingRepo: IBookingRepo) { }

    async createAdvancePaymentIntent(bookingId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<{ clientSecret: string; amount: number }> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }
        if (booking.userId.toString() !== userId.toString()) {
            throw new Error("Unauthorized to pay for this booking");
        }
        if (booking.bookingStatus !== "approved") {
            throw new Error("Booking must be approved to pay advance");
        }

        if (booking.paymentIntentId) {
            // Return existing intent if already created
            const existingIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
            if (existingIntent.client_secret) {
                return { clientSecret: existingIntent.client_secret, amount: booking.advancePaid };
            }
        }

        // Amount must be in cents/paise for Stripe
        const amountInSmallestUnit = Math.round(booking.advancePaid * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: "inr",
            capture_method: "manual",
            metadata: {
                bookingId: booking._id.toString(),
                userId: booking.userId.toString(),
            },
        });

        await this._bookingRepo.updateBookingDetails(bookingId, {
            paymentIntentId: paymentIntent.id,
        });

        return {
            clientSecret: paymentIntent.client_secret as string,
            amount: booking.advancePaid,
        };
    }

    async capturePayment(bookingId: string | Types.ObjectId): Promise<{ success: boolean; message: string }> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }
        if (!booking.paymentIntentId) {
            throw new Error("No payment internet found for this booking");
        }

        if (booking.bookingStatus !== "ride_started" && booking.bookingStatus !== "advance_authorized") {
            throw new Error("Payment can only be captured if ride has started or is authorized");
        }

        try {
            await stripe.paymentIntents.capture(booking.paymentIntentId);
            // The webhook will update the db, but we can also optimally update it here.
            await this._bookingRepo.updateBookingDetails(bookingId, {
                paymentStatus: "captured",
                bookingStatus: "payment_captured", // or you can keep ride_started if you want that as the primary status
            });

            // Add the captured advance to the owner's wallet
            const walletRepo = new WalletRepo();
            const walletService = new WalletService(walletRepo);
            await walletService.addTransaction(
                booking.ownerId.toString(),
                booking.advancePaid,
                "credit",
                `Advance payment received for booking ${booking.bookingId}`
            );

            return { success: true, message: "Payment successfully captured and added to wallet" };
        } catch (error) {
            console.error("Error capturing payment:", error);
            throw new Error("Captured failed: " + (error as Error).message);
        }
    }

    async cancelPaymentIntent(bookingId: string | Types.ObjectId): Promise<{ success: boolean; message: string }> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking || !booking.paymentIntentId) {
            return { success: false, message: "No payment intent to cancel" };
        }

        try {
            const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
            if (intent.status === "requires_capture" || intent.status === "requires_payment_method") {
                await stripe.paymentIntents.cancel(booking.paymentIntentId);
                await this._bookingRepo.updateBookingDetails(bookingId, {
                    paymentStatus: "refunded",
                });
                return { success: true, message: "Payment hold released" };
            }
            return { success: false, message: "Payment cannot be cancelled in its current state" };
        } catch (error) {
            console.error("Error cancelling payment intent:", error);
            throw new Error("Failed to cancel payment intent: " + (error as Error).message);
        }
    }

    async handleWebhook(body: any, signature: string): Promise<void> {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!endpointSecret) {
            throw new Error("Stripe webhook secret is missing");
        }

        let event: import("stripe").Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            throw new Error("Webhook Error");
        }

        switch (event.type) {
            case "payment_intent.amount_capturable_updated": {
                const paymentIntent = event.data.object as any;
                const bookingId = paymentIntent.metadata.bookingId;
                if (bookingId) {
                    await this._bookingRepo.updateBookingDetails(bookingId, {
                        bookingStatus: "advance_authorized",
                        paymentStatus: "authorized",
                    });
                }
                break;
            }
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as any;

                if (paymentIntent.metadata.purpose === "wallet_funding") {
                    const userId = paymentIntent.metadata.userId;
                    const amount = parseFloat(paymentIntent.metadata.amount);
                    if (userId && amount) {
                        try {
                            const walletRepo = new WalletRepo();
                            const walletService = new WalletService(walletRepo);
                            await walletService.addTransaction(userId, amount, "credit", "Wallet Top-up via Stripe");
                        } catch (err) {
                            console.error("Failed to add money to wallet from webhook:", err);
                        }
                    }
                } else {
                    const bookingId = paymentIntent.metadata.bookingId;
                    if (bookingId) {
                        await this._bookingRepo.updateBookingDetails(bookingId, {
                            paymentStatus: "captured",
                        });
                    }
                }
                break;
            }
            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as any;
                const bookingId = paymentIntent.metadata.bookingId;
                if (bookingId) {
                    await this._bookingRepo.updateBookingDetails(bookingId, {
                        paymentStatus: "failed",
                    });
                }
                break;
            }
            case "payment_intent.canceled": {
                const paymentIntent = event.data.object as any;
                const bookingId = paymentIntent.metadata.bookingId;
                if (bookingId) {
                    await this._bookingRepo.updateBookingDetails(bookingId, {
                        paymentStatus: "refunded",
                    });
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
}
