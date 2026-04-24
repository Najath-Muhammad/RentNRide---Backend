import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { HttpStatus } from "../constants/enum/statuscode";
import { sendContactMail } from "../utils/mailer.utils";
import { errorResponse, successResponse } from "../utils/response.util";

const router = Router();

const contactSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(50),
	lastName: z.string().min(1, "Last name is required").max(50),
	email: z.string().email("Invalid email address"),
	subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
	message: z
		.string()
		.min(10, "Message must be at least 10 characters")
		.max(2000),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const parsed = contactSchema.safeParse(req.body);
		if (!parsed.success) {
			return errorResponse(
				res,
				parsed.error.issues[0].message,
				HttpStatus.BAD_REQUEST,
			);
		}

		const sent = await sendContactMail(parsed.data);
		if (!sent) {
			return errorResponse(
				res,
				"Failed to send message. Please try again later.",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return successResponse(
			res,
			"Message sent successfully! We'll get back to you within 24–48 hours.",
		);
	} catch (error) {
		console.error("Contact route error:", error);
		return errorResponse(
			res,
			"Internal server error",
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}
});

export default router;
