import type { Types } from "mongoose";
import { env } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { WalletRepo } from "../../repositories/Implementation/wallet.repository";
import type { IBookingRepo } from "../../repositories/interfaces/booking.interface";
import type { IPaymentService } from "../interfaces/payment.interface.service";
import { WalletService } from "./wallet.service";
import { WalletModel } from "../../model/wallet.model";

export class PaymentService implements IPaymentService {
	constructor(private _bookingRepo: IBookingRepo) { }

	async createAdvancePaymentIntent(
		bookingId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	): Promise<{ clientSecret: string; amount: number }> {
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
			// Return existing intent if already created, but ONLY if it still needs payment
			const existingIntent = await stripe.paymentIntents.retrieve(
				booking.paymentIntentId,
			);

			if (existingIntent.status === "requires_payment_method") {
				if (existingIntent.client_secret) {
					return {
						clientSecret: existingIntent.client_secret,
						amount: booking.advancePaid,
					};
				}
			} else if (
				existingIntent.status === "requires_capture" ||
				existingIntent.status === "succeeded"
			) {
				throw new Error(
					"Payment has already been authorized or captured for this booking.",
				);
			}
		}

		// Amount must be in cents/paise for Stripe
		const amountInSmallestUnit = Math.round(booking.advancePaid * 100);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInSmallestUnit,
			currency: "inr",
			payment_method_types: ["card"],
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

	async capturePayment(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) {
			throw new Error("Booking not found");
		}
		if (booking.paymentMethod === 'wallet') {
			await this._bookingRepo.updateBookingDetails(bookingId, {
				paymentStatus: "captured",
				bookingStatus: "payment_captured",
			});
			return {
				success: true,
				message: "Wallet payment confirmed successfully",
			};
		}

		if (!booking.paymentIntentId) {
			throw new Error("No payment intent found for this booking");
		}

		if (
			booking.bookingStatus !== "ride_started" &&
			booking.bookingStatus !== "advance_authorized"
		) {
			throw new Error(
				"Payment can only be captured if ride has started or is authorized",
			);
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
				`Advance payment received for booking ${booking.bookingId}`,
			);

			return {
				success: true,
				message: "Payment successfully captured and added to wallet",
			};
		} catch (error) {
			console.error("Error capturing payment:", error);
			throw new Error(`Captured failed: ${(error as Error).message}`);
		}
	}

	async verifyAdvancePayment(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking || !booking.paymentIntentId) {
			throw new Error("No payment intent found for this booking");
		}

		try {
			const intent = await stripe.paymentIntents.retrieve(
				booking.paymentIntentId,
			);
			if (intent.status === "requires_capture") {
				await this._bookingRepo.updateBookingDetails(bookingId, {
					bookingStatus: "advance_authorized",
					paymentStatus: "authorized",
				});

				const walletRepo = new WalletRepo();
				const walletService = new WalletService(walletRepo);

				// 1. Record debit history entry for the user (no balance deduction — paid via Stripe card)
				try {
					const userWallet = await walletService.getWallet(booking.userId.toString());
					await WalletModel.findByIdAndUpdate(
						userWallet._id,
						{
							$push: {
								transactionHistory: {
									$each: [{
										amount: booking.advancePaid,
										transactionType: "debit",
										description: `Advance payment paid via card for booking ${booking.bookingId}`,
										date: new Date(),
									}],
									$position: 0,
								},
							},
						},
						{ new: true },
					);
				} catch (userWalletErr) {
					console.error("Failed to record user payment history (non-fatal):", userWalletErr);
				}

				// 2. Credit the owner's wallet immediately
				try {
					await walletService.addTransaction(
						booking.ownerId.toString(),
						booking.advancePaid,
						"credit",
						`Advance payment received for booking ${booking.bookingId}`,
					);
				} catch (ownerWalletErr) {
					console.error("Failed to credit owner wallet (non-fatal):", ownerWalletErr);
				}

				return { success: true, message: "Payment verified successfully" };
			}
			return { success: false, message: "Payment not authorized yet" };
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}

	async cancelPaymentIntent(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking || !booking.paymentIntentId) {
			return { success: false, message: "No payment intent to cancel" };
		}

		try {
			const intent = await stripe.paymentIntents.retrieve(
				booking.paymentIntentId,
			);
			if (
				intent.status === "requires_capture" ||
				intent.status === "requires_payment_method"
			) {
				await stripe.paymentIntents.cancel(booking.paymentIntentId);
				await this._bookingRepo.updateBookingDetails(bookingId, {
					paymentStatus: "refunded",
				});
				return { success: true, message: "Payment hold released" };
			}
			return {
				success: false,
				message: "Payment cannot be cancelled in its current state",
			};
		} catch (error) {
			console.error("Error cancelling payment intent:", error);
			throw new Error(
				`Failed to cancel payment intent: ${(error as Error).message}`,
			);
		}
	}

	async payWithWallet(
		bookingId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) throw new Error("Booking not found");
		if (booking.userId.toString() !== userId.toString()) {
			throw new Error("Unauthorized to pay for this booking");
		}
		if (booking.bookingStatus !== "approved") {
			throw new Error("Booking must be approved before paying advance");
		}
		if (booking.paymentStatus === "authorized" || booking.paymentStatus === "captured") {
			throw new Error("Advance has already been paid for this booking");
		}

		const walletRepo = new WalletRepo();
		const walletService = new WalletService(walletRepo);

		// Check balance
		const userWallet = await walletService.getWallet(userId.toString());
		if (userWallet.balance < booking.advancePaid) {
			throw new Error(
				`Insufficient wallet balance. Required: ₹${booking.advancePaid}, Available: ₹${userWallet.balance}`,
			);
		}

		// Debit user wallet
		await walletService.addTransaction(
			userId.toString(),
			booking.advancePaid,
			"debit",
			`Advance payment via wallet for booking ${booking.bookingId}`,
		);

		// Credit owner wallet immediately
		await walletService.addTransaction(
			booking.ownerId.toString(),
			booking.advancePaid,
			"credit",
			`Advance payment received for booking ${booking.bookingId}`,
		);

		// Mark booking as advance_authorized (same state as Stripe card flow)
		await this._bookingRepo.updateBookingDetails(bookingId, {
			bookingStatus: "advance_authorized",
			paymentStatus: "authorized",
			paymentMethod: "wallet",
		});

		return { success: true, message: "Advance paid successfully from wallet" };
	}


	async processRefund(
		bookingId: string | Types.ObjectId,
		refundAmount: number,
		cancellationCharge: number,
	): Promise<{ success: boolean; message: string }> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking || !booking.paymentIntentId) {
			return { success: false, message: "No payment intent to refund" };
		}

		try {
			const intent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

			if (intent.status === "requires_capture") {
				// Payment is authorized but not captured
				if (cancellationCharge > 0) {
					// Capture only the penalty, releases the rest
					await stripe.paymentIntents.capture(booking.paymentIntentId, {
						amount_to_capture: Math.round(cancellationCharge * 100),
					});
					
					// Credit penalty to owner's wallet (since advance was taken back, we give owner their share of the penalty)
					if (booking.ownerId) {
						const walletRepo = new WalletRepo();
						const walletService = new WalletService(walletRepo);
						await walletService.addTransaction(
							booking.ownerId.toString(),
							cancellationCharge,
							"credit",
							`Cancellation charge received for booking ${booking.bookingId}`,
						);
					}

					await this._bookingRepo.updateBookingDetails(bookingId, {
						paymentStatus: "refunded",
						refundStatus: "processed",
					});
					return { success: true, message: "Partial refund processed (penalty captured)" };
				} else {
					// 100% refund, just cancel the intent
					await stripe.paymentIntents.cancel(booking.paymentIntentId);
					await this._bookingRepo.updateBookingDetails(bookingId, {
						paymentStatus: "refunded",
						refundStatus: "processed",
					});
					return { success: true, message: "Full refund processed (hold released)" };
				}
			} else if (intent.status === "succeeded" || intent.status === "processing") {
				// Already captured, we must issue an actual refund via Stripe Refunds API
				if (refundAmount > 0) {
					await stripe.refunds.create({
						payment_intent: booking.paymentIntentId,
						amount: Math.round(refundAmount * 100),
					});
				}
				await this._bookingRepo.updateBookingDetails(bookingId, {
					paymentStatus: "refunded",
					refundStatus: "processed",
				});
				return { success: true, message: "Refund processed" };
			}

			return { success: false, message: "Payment state does not allow refund" };
		} catch (error) {
			console.error("Error processing refund:", error);
			await this._bookingRepo.updateBookingDetails(bookingId, {
				refundStatus: "failed",
			});
			throw new Error(`Refund failed: ${(error as Error).message}`);
		}
	}

	async handleWebhook(body: string | Buffer, signature: string): Promise<void> {
		const endpointSecret = env.STRIPE_WEBHOOK_SECRET;

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
				const paymentIntent = event.data
					.object as import("stripe").Stripe.PaymentIntent;
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
				const paymentIntent = event.data
					.object as import("stripe").Stripe.PaymentIntent;

				if (paymentIntent.metadata.purpose === "wallet_funding") {
					const userId = paymentIntent.metadata.userId;
					const amount = parseFloat(paymentIntent.metadata.amount);
					if (userId && amount) {
						try {
							const walletRepo = new WalletRepo();
							const walletService = new WalletService(walletRepo);
							await walletService.addTransaction(
								userId,
								amount,
								"credit",
								"Wallet Top-up via Stripe",
							);
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
				const paymentIntent = event.data
					.object as import("stripe").Stripe.PaymentIntent;
				const bookingId = paymentIntent.metadata.bookingId;
				if (bookingId) {
					await this._bookingRepo.updateBookingDetails(bookingId, {
						paymentStatus: "failed",
					});
				}
				break;
			}
			case "payment_intent.canceled": {
				const paymentIntent = event.data
					.object as import("stripe").Stripe.PaymentIntent;
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
