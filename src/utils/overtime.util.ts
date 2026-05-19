/**
 * Overtime / Late-Return Fee Calculator
 * ─────────────────────────────────────
 * Grace period : 2 hours
 * 1–6 h late   : hourly charge  (pricePerDay / 24)
 * > 6 h late   : full extra-day charge
 */

export interface OvertimeResult {
	extraHours: number;
	extraDays: number;
	lateFee: number;           // Total late charge in ₹
	overtimeCharge: number;    // Same alias kept for schema field
	gracePeriodHours: number;
	isOverGrace: boolean;
}

const GRACE_PERIOD_HOURS = 2;
const HOURLY_THRESHOLD_HOURS = 6; // beyond this → full-day charge

export function calculateOvertimeFee(
	expectedReturn: Date,
	actualReturn: Date,
	pricePerDay: number,
): OvertimeResult {
	const diffMs = actualReturn.getTime() - expectedReturn.getTime();

	// Returned on time or early
	if (diffMs <= 0) {
		return {
			extraHours: 0,
			extraDays: 0,
			lateFee: 0,
			overtimeCharge: 0,
			gracePeriodHours: GRACE_PERIOD_HOURS,
			isOverGrace: false,
		};
	}

	const diffHours = diffMs / (1000 * 60 * 60);

	// Within grace period
	if (diffHours <= GRACE_PERIOD_HOURS) {
		return {
			extraHours: Math.ceil(diffHours),
			extraDays: 0,
			lateFee: 0,
			overtimeCharge: 0,
			gracePeriodHours: GRACE_PERIOD_HOURS,
			isOverGrace: false,
		};
	}

	const billableHours = diffHours - GRACE_PERIOD_HOURS;
	const hourlyRate = pricePerDay / 24;
	let lateFee: number;
	let extraDays = 0;

	if (billableHours <= HOURLY_THRESHOLD_HOURS) {
		// Hourly billing
		lateFee = Math.ceil(billableHours) * hourlyRate;
	} else {
		// Full-day billing for every started extra day
		extraDays = Math.ceil(billableHours / 24);
		lateFee = extraDays * pricePerDay;
	}

	lateFee = Math.round(lateFee);

	return {
		extraHours: Math.ceil(diffHours),
		extraDays,
		lateFee,
		overtimeCharge: lateFee,
		gracePeriodHours: GRACE_PERIOD_HOURS,
		isOverGrace: true,
	};
}

/**
 * Estimate running late fee when the vehicle has NOT been returned yet.
 * Uses current time as `actualReturn`.
 */
export function calculateRunningOvertimeFee(
	expectedReturn: Date,
	pricePerDay: number,
): OvertimeResult {
	return calculateOvertimeFee(expectedReturn, new Date(), pricePerDay);
}

/** Format ₹ for display */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}
