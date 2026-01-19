import { z } from "zod";

const rcNumberRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

const futureDate = () =>
	z
		.string()
		.refine(
			(date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
			{ message: "Date cannot be in the past" },
		);

export const createVehicleSchema = z.object({
	category: z.string().min(1, "Category is required"),
	make: z.string().min(1, "Make is required"),
	model: z.string().min(1, "Model is required"),
	category2: z.string().optional(),
	fuelType: z.string().min(1, "Fuel type is required"),

	seatCapacity: z.coerce
		.number({ message: "Seat capacity must be a valid number" })
		.int({ message: "Seat capacity must be a whole number" })
		.min(1, "Minimum 1 seat")
		.max(50, "Maximum 50 seats"),

	pricePerDay: z.coerce
		.number({ message: "Price must be a valid number" })
		.positive("Price must be greater than 0"),

	availableQuantity: z.coerce
		.number({ message: "Available quantity must be a valid number" })
		.int({ message: "Must be a whole number" })
		.min(0, "Cannot be negative"),

	doors: z.coerce
		.number({ message: "Doors must be a valid number" })
		.int({ message: "Doors must be a whole number" })
		.min(2, "Minimum 2 doors")
		.max(6, "Maximum 6 doors"),

	images: z
		.array(z.string().url("Invalid image URL"))
		.min(1, "At least one vehicle image is required")
		.max(10, "Maximum 10 images allowed"),

	rcNumber: z
		.string()
		.regex(rcNumberRegex, "Invalid RC number format (e.g., KL01AB1234)")
		.transform((val) => val.toUpperCase().replace(/\s/g, "")),

	rcExpiryDate: futureDate(),

	insuranceProvider: z.string().min(1, "Insurance provider is required"),
	insurancePolicyNumber: z
		.string()
		.min(5, "Policy number must be at least 5 characters"),

	insuranceExpiryDate: futureDate(),
	insuranceDocumentUrl: z.string().url("Invalid document URL").optional(),

	pickupAddress: z
		.string()
		.min(10, "Pickup address must be at least 10 characters"),

	regionalContact: z
		.string()
		.regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
