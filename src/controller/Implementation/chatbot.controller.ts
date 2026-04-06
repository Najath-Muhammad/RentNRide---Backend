import type { Request, Response } from "express";
import { Groq } from "groq-sdk";
import { env } from "../../config/env";
import { HttpStatus } from "../../constants/enum/statuscode";
import { Category } from "../../model/category.model";
import type { IVehicleService } from "../../services/interfaces/vehicle.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";

export class ChatbotController {
	constructor(private _vehicleService: IVehicleService) { }

	async handleChat(req: Request, res: Response) {
		try {
			const { message } = req.body;
			if (!message) {
				return errorResponse(
					res,
					"Message is required",
					HttpStatus.BAD_REQUEST,
				);
			}

			const prompt = `You are an AI assistant for a vehicle rental app called RentNride.
A user asked: "${message}"

If the user is ONLY having a general conversation or asking a generic question (like "hello", "how are you", "what is this app"), return strictly:
{
  "intent": "chat",
  "reply": "your helpful and polite reply here"
}

If the user is expressing an interest or intent to search for a vehicle to rent (e.g., "I need a car", "show me bikes in kochi", "do you have BMWs?", "i want to rent an SUV"), extract the search criteria and return strictly:
{
  "intent": "search",
  "filters": {
    "vehicleType": "bike" | "car" | "scooter" | null,
    "location": "string or null",
    "brand": "string or null",
    "name": "string (like Himalayan, R15) or null",
    "maxPrice": number or null
  }
}
Return ONLY JSON matching one of the two formats. Do not return markdown formatted text or explanations.`;

			interface ChatbotIntent {
				intent: string;
				reply?: string;
				filters?: {
					vehicleType?: string | null;
					location?: string | null;
					brand?: string | null;
					name?: string | null;
					maxPrice?: number | null;
				};
			}
			let responseJSON: ChatbotIntent;

			try {
				const groq = new Groq({ apiKey: env.GROQ_API_KEY });
				const completion = await groq.chat.completions.create({
					messages: [{ role: "user", content: prompt }],
					model: "llama-3.3-70b-versatile",
					temperature: 0.1,
				});

				const content = completion.choices[0]?.message?.content || "{}";

				// Strip possible markdown wrapping if the AI decides to add it
				let cleanedContent = content.trim();
				if (cleanedContent.startsWith("```json")) {
					cleanedContent = cleanedContent
						.replace(/```json/i, "")
						.replace(/```/i, "")
						.trim();
				} else if (cleanedContent.startsWith("```")) {
					cleanedContent = cleanedContent.replace(/```/g, "").trim();
				}

				responseJSON = JSON.parse(cleanedContent);
			} catch (err) {
				console.error("Failed to fetch or parse LLM JSON:", err);
				return errorResponse(
					res,
					"Could not understand your request. Please try rewriting it.",
					HttpStatus.BAD_REQUEST,
				);
			}

			if (responseJSON.intent === "chat") {
				return successResponse(res, "Chat reply", {
					intent: "chat",
					reply: responseJSON.reply,
					vehicles: [],
				});
			}

			// Map extracted filters to the actual parameters expected by getPublicVehicles
			const parsedFilters: {
				search?: string;
				category?: string[];
				maxPrice?: number;
			} = {};
			const searchTerms = [];

			if (responseJSON.filters?.vehicleType) {
				// Find matching category ID since repo requires ObjectId
				const categoryMatch = await Category.findOne({
					name: {
						$regex: new RegExp(`^${responseJSON.filters.vehicleType}$`, "i"),
					},
				});
				if (categoryMatch) {
					parsedFilters.category = [categoryMatch._id.toString()];
				}
			}

			if (responseJSON.filters?.location)
				searchTerms.push(responseJSON.filters.location);
			if (responseJSON.filters?.brand)
				searchTerms.push(responseJSON.filters.brand);
			if (responseJSON.filters?.name)
				searchTerms.push(responseJSON.filters.name);

			if (searchTerms.length > 0) {
				parsedFilters.search = searchTerms.join(" ");
			}

			if (responseJSON.filters?.maxPrice)
				parsedFilters.maxPrice = responseJSON.filters.maxPrice;

			// Call the existing public search API logic
			// page=1, limit=10, lat/lon=undefined, range=undefined, minRange=undefined
			const result = await this._vehicleService.getPublicVehicles(
				1,
				10,
				undefined,
				undefined,
				undefined,
				undefined,
				parsedFilters,
			);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			const payloadData = result.data ? result.data.data : [];

			return successResponse(res, "Found vehicles", {
				intent: "search",
				filters: parsedFilters,
				vehicles: payloadData,
				total: result.data ? result.data.total : 0,
			});
		} catch (error) {
			console.error("Chatbot Error:", error);
			return errorResponse(
				res,
				"Internal AI server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
