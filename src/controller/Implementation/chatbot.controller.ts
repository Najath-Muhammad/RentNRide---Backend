import type { Request, Response } from "express";
import { Groq } from "groq-sdk";
import type { IVehicleService } from "../../services/Interfaces/vehicle.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { HttpStatus } from "../../constants/enum/statuscode";
import { Category } from "../../model/category.model";

export class ChatbotController {
    constructor(private _vehicleService: IVehicleService) { }

    async handleChat(req: Request, res: Response) {
        try {
            const { message } = req.body;
            if (!message) {
                return errorResponse(res, "Message is required", HttpStatus.BAD_REQUEST);
            }

            const prompt = `You are an AI assistant for a vehicle rental app called RentNride.
A user asked: "${message}"

Extract the search filters and return strictly a valid JSON object matching this schema:
{
  "vehicleType": "bike" | "car" | "scooter" | null,
  "location": "string or null",
  "maxPrice": number or null
}
Return ONLY JSON, no markdown formatting or explaining text.`;

            let filters: any;

            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.1,
                });

                const content = completion.choices[0]?.message?.content || "{}";

                // Strip possible markdown wrapping if the AI decides to add it
                let cleanedContent = content.trim();
                if (cleanedContent.startsWith("\`\`\`json")) {
                    cleanedContent = cleanedContent.replace(/\`\`\`json/i, "").replace(/\`\`\`/i, "").trim();
                } else if (cleanedContent.startsWith("\`\`\`")) {
                    cleanedContent = cleanedContent.replace(/\`\`\`/g, "").trim();
                }

                filters = JSON.parse(cleanedContent);
            } catch (err) {
                console.error("Failed to fetch or parse LLM JSON:", err);
                if (err instanceof Error) {
                    console.error("Error message:", err.message);
                    console.error("Error stack:", err.stack);
                }
                return errorResponse(res, "Could not understand your search criteria. Please try rewriting your request.", HttpStatus.BAD_REQUEST);
            }

            // Map extracted filters to the actual parameters expected by getPublicVehicles
            const parsedFilters: Record<string, any> = {};
            if (filters.vehicleType) {
                // Find matching category ID since repo requires ObjectId
                const categoryMatch = await Category.findOne({ name: { $regex: new RegExp(`^${filters.vehicleType}$`, 'i') } });
                if (categoryMatch) {
                    parsedFilters.category = [categoryMatch._id.toString()];
                }
            }
            if (filters.location) parsedFilters.search = filters.location; // The getPublicVehicles uses search block for fuzzy location match typically
            if (filters.maxPrice) parsedFilters.maxPrice = filters.maxPrice;

            // Call the existing public search API logic 
            // page=1, limit=10, lat/lon=undefined, range=undefined, minRange=undefined
            const result = await this._vehicleService.getPublicVehicles(
                1,
                10,
                undefined,
                undefined,
                undefined,
                undefined,
                parsedFilters
            );

            if (!result.success) {
                return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
            }

            const payloadData = result.data ? result.data.data : [];

            return successResponse(res, "Found vehicles", {
                filters: parsedFilters,
                vehicles: payloadData,
                total: result.data ? result.data.total : 0
            });

        } catch (error) {
            console.error("Chatbot Error:", error);
            return errorResponse(res, "Internal AI server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
