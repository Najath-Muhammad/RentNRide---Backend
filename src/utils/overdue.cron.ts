/**
 * Overdue Detection Scheduler
 * ───────────────────────────
 * Runs every 30 minutes. Marks active bookings as overdue if the expected
 * return date has passed. Sends push notifications to the renter and owner.
 */

import { BookingModel } from "../model/booking.model";
import { sendPushNotification } from "./fcm.util";
import { calculateRunningOvertimeFee } from "./overtime.util";

const OVERDUE_THRESHOLD_HOURS = 48; // Auto-escalate after this many hours
const POLL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function startOverdueCron(): void {
	console.log("[Overdue Cron] Starting — polling every 30 minutes");
	// Run immediately on startup, then on an interval
	checkOverdueBookings();
	setInterval(checkOverdueBookings, POLL_INTERVAL_MS);
}

async function checkOverdueBookings(): Promise<void> {
	try {
		const now = new Date();

		// Find bookings that are active (ride started / extended) but past expectedReturnDate
		const overdueBookings = await BookingModel.find({
			bookingStatus: { $in: ["ride_started", "extended"] },
			returnStatus: { $in: ["pending", "extended"] },
			expectedReturnDate: { $lt: now },
		}).populate("userId", "_id name email")
		  .populate("ownerId", "_id name email");

		if (overdueBookings.length === 0) return;

		console.log(`[Overdue Cron] Found ${overdueBookings.length} overdue booking(s)`);

		for (const booking of overdueBookings) {
			try {
				const fee = calculateRunningOvertimeFee(
					booking.expectedReturnDate!,
					booking.pricePerDay,
				);

				const isEscalated =
					(now.getTime() - booking.expectedReturnDate!.getTime()) / (1000 * 60 * 60) >
					OVERDUE_THRESHOLD_HOURS;

				// Update booking status
				await BookingModel.findByIdAndUpdate(booking._id, {
					bookingStatus: "overdue",
					returnStatus: "overdue",
					overtimeCharge: fee.overtimeCharge,
					extraHours: fee.extraHours,
					extraDays: fee.extraDays,
					pendingDues: fee.lateFee,
				});

				const userId = (booking.userId as { _id: { toString(): string } })._id.toString();
				const ownerId = (booking.ownerId as { _id: { toString(): string } })._id.toString();
				const hoursLate = Math.ceil(
					(now.getTime() - booking.expectedReturnDate!.getTime()) / (1000 * 60 * 60),
				);

				// Notify renter
				await sendPushNotification(userId, {
					title: "⚠️ Vehicle Return Overdue",
					body: `Your booking ${booking.bookingId} is ${hoursLate}h overdue. Late charge: ₹${fee.lateFee.toLocaleString("en-IN")}. Please return immediately.`,
					data: { type: "overdue", bookingId: booking.bookingId },
				});

				// Notify owner
				await sendPushNotification(ownerId, {
					title: "🚨 Vehicle Not Returned",
					body: `Booking ${booking.bookingId} is ${hoursLate}h overdue. Running late charge: ₹${fee.lateFee.toLocaleString("en-IN")}.`,
					data: { type: "overdue", bookingId: booking.bookingId },
				});

				// Escalation alert (to admin via a system notification)
				if (isEscalated) {
					console.warn(
						`[Overdue Cron] ESCALATION: Booking ${booking.bookingId} overdue by ${hoursLate}h`,
					);
				}
			} catch (innerErr) {
				console.error(
					`[Overdue Cron] Error processing booking ${booking.bookingId}:`,
					innerErr,
				);
			}
		}
	} catch (err) {
		console.error("[Overdue Cron] Fatal error during check:", err);
	}
}

/**
 * Return reminder scheduler — runs once per hour.
 * Sends reminders 24 h and 2 h before expected return.
 */
export function startReturnReminderCron(): void {
	console.log("[Return Reminder Cron] Starting — polling every hour");
	checkReturnReminders();
	setInterval(checkReturnReminders, 60 * 60 * 1000);
}

async function checkReturnReminders(): Promise<void> {
	try {
		const now = new Date();
		const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
		const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
		const windowMs = 5 * 60 * 1000; // ± 5-minute window to avoid duplicate sends

		// 24 h reminder
		const bookings24h = await BookingModel.find({
			bookingStatus: { $in: ["ride_started", "extended"] },
			expectedReturnDate: {
				$gte: new Date(in24h.getTime() - windowMs),
				$lte: new Date(in24h.getTime() + windowMs),
			},
		}).populate("userId", "_id");

		for (const b of bookings24h) {
			const uid = (b.userId as { _id: { toString(): string } })._id.toString();
			await sendPushNotification(uid, {
				title: "📅 Return Reminder",
				body: `Your rental (${b.bookingId}) is due back in 24 hours. Avoid late charges!`,
				data: { type: "reminder", bookingId: b.bookingId },
			});
		}

		// 2 h reminder
		const bookings2h = await BookingModel.find({
			bookingStatus: { $in: ["ride_started", "extended"] },
			expectedReturnDate: {
				$gte: new Date(in2h.getTime() - windowMs),
				$lte: new Date(in2h.getTime() + windowMs),
			},
		}).populate("userId", "_id");

		for (const b of bookings2h) {
			const uid = (b.userId as { _id: { toString(): string } })._id.toString();
			await sendPushNotification(uid, {
				title: "⏰ Return Due Soon!",
				body: `Your rental (${b.bookingId}) is due back in 2 hours. Please head back now!`,
				data: { type: "reminder", bookingId: b.bookingId },
			});
		}
	} catch (err) {
		console.error("[Return Reminder Cron] Error:", err);
	}
}
