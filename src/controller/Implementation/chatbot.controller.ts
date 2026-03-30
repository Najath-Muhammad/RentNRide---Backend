import type { Request, Response } from "express";
import { Groq } from "groq-sdk";
import type { IVehicleService } from "../../services/Interfaces/vehicle.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { HttpStatus } from "../../constants/enum/statuscode";
import { Category } from "../../model/category.model";
import { FuelType } from "../../model/fueltype.model";

export class ChatbotController {
    constructor(private _vehicleService: IVehicleService) { }

    async handleChat(req: Request, res: Response) {
        try {
            const { message } = req.body;
            if (!message) {
                return errorResponse(res, "Message is required", HttpStatus.BAD_REQUEST);
            }

            const prompt = `You are an AI assistant for a vehicle rental platform called RentNride.
A user sent this message: "${message}"

Your job:
1. Determine the INTENT of the message.
2. If it is casual conversation (greetings, questions about the app, general chat), set intent to "chat" and write a friendly, short reply in the "reply" field.
3. If the user is looking for a vehicle to rent, set intent to "search" and extract as many filters as possible from this list.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "intent": "chat" | "search",
  "reply": "string (only when intent is chat, else null)",
  "vehicleType": "car" | "bike" | "scooter" | null,
  "subType": "SUV" | "Sedan" | "Hatchback" | "MUV" | "Coupe" | "Sports" | "Standard" | null,
  "brand": "string or null (e.g. BMW, Honda, Royal Enfield, Swift)",
  "location": "string or null (city or area the user wants to rent from)",
  "fuelType": "Petrol" | "Diesel" | "Electric" | "CNG" | "Hybrid" | null,
  "transmission": "Manual" | "Automatic" | null,
  "minSeats": number or null (minimum passengers, e.g. 5, 7),
  "doors": number or null (number of doors, e.g. 2, 4),
  "minPrice": number or null (minimum price per day in INR),
  "maxPrice": number or null (maximum price per day in INR)
}

Rules:
- vehicleType: use "car" for cars/SUVs/sedans, "bike" for motorcycles/bikes, "scooter" for scooters
- subType: body style only, null if not mentioned
- brand: vehicle make/model (BMW, Honda City, Royal Enfield Bullet), null if not mentioned
- location: the city/area for pickup, null if not mentioned
- fuelType: fuel source, null if not mentioned
- transmission: gearbox type, null if not mentioned
- minSeats: extract from phrases like "7 seater", "family car for 6", null if not mentioned
- doors: null unless explicitly stated
- minPrice/maxPrice: extract from price/budget mentions (e.g. "under 1000" → maxPrice: 1000), null if not mentioned
- All numeric fields must be numbers, not strings`;

            let groqResult: {
                intent: "chat" | "search";
                reply?: string;
                vehicleType?: string;
                subType?: string;
                brand?: string;
                location?: string;
                fuelType?: string;
                transmission?: string;
                minSeats?: number;
                doors?: number;
                minPrice?: number;
                maxPrice?: number;
            };

            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.1,
                });

                let content = (completion.choices[0]?.message?.content || "{}").trim();
                // Strip markdown code fences if present
                if (content.startsWith("```json")) content = content.replace(/```json/i, "").replace(/```/g, "").trim();
                else if (content.startsWith("```")) content = content.replace(/```/g, "").trim();

                groqResult = JSON.parse(content);
                console.log("[Chatbot] Groq result:", groqResult);
            } catch (err) {
                console.error("[Chatbot] Failed to parse Groq response:", err);
                return errorResponse(res, "Could not understand your message. Please try rephrasing.", HttpStatus.BAD_REQUEST);
            }

            if (groqResult.intent === "chat") {
                return successResponse(res, "Chat reply", {
                    intent: "chat",
                    reply: groqResult.reply || "I'm here to help you find vehicles on RentNride! Try asking something like 'I need an SUV in Kochi under ₹2000'.",
                    vehicles: [],
                    total: 0,
                });
            }

            const parsedFilters: {
                search?: string;
                category?: string[];
                category2?: string;
                fuelType?: string[];
                transmission?: string[];
                minPrice?: number;
                maxPrice?: number;
                minSeats?: number;
                doors?: number;
            } = {};

            if (groqResult.vehicleType) {
                const categoryMatch = await Category.findOne({
                    name: { $regex: new RegExp(`\\b${groqResult.vehicleType}s?\\b`, "i") },
                    isActive: true,
                });
                if (categoryMatch) {
                    parsedFilters.category = [categoryMatch._id.toString()];
                    console.log(`[Chatbot] Category matched: "${categoryMatch.name}"`);

                    if (groqResult.subType && typeof groqResult.subType === "string") {
                        const subCat = categoryMatch.subCategories?.find(
                            (sc) => sc.name.toLowerCase() === groqResult.subType!.toLowerCase()
                        );
                        if (subCat?._id) {
                            parsedFilters.category2 = subCat._id.toString();
                            console.log(`[Chatbot] SubCategory matched: "${subCat.name}"`);
                        } else {
                            console.warn(`[Chatbot] No subCategory found for: "${groqResult.subType}"`);
                        }
                    }
                } else {
                    console.warn(`[Chatbot] No category found for vehicleType: "${groqResult.vehicleType}"`);
                }
            }

            // 3c. Resolve fuelType name → FuelType ObjectId
            if (groqResult.fuelType && typeof groqResult.fuelType === "string") {
                const fuelMatch = await FuelType.findOne({
                    name: { $regex: new RegExp(`^${groqResult.fuelType}$`, "i") },
                    isActive: true,
                });
                if (fuelMatch) {
                    parsedFilters.fuelType = [fuelMatch._id.toString()];
                    console.log(`[Chatbot] FuelType matched: "${fuelMatch.name}"`);
                } else {
                    console.warn(`[Chatbot] No fuelType found for: "${groqResult.fuelType}"`);
                }
            }

            if (groqResult.transmission && typeof groqResult.transmission === "string") {
                parsedFilters.transmission = [groqResult.transmission];
            }

            const searchTerms: string[] = [];
            if (groqResult.brand?.trim()) searchTerms.push(groqResult.brand.trim());
            if (groqResult.location?.trim()) searchTerms.push(groqResult.location.trim());
            if (searchTerms.length > 0) parsedFilters.search = searchTerms.join(" ");

            if (typeof groqResult.minPrice === "number" && groqResult.minPrice > 0) parsedFilters.minPrice = groqResult.minPrice;
            if (typeof groqResult.maxPrice === "number" && groqResult.maxPrice > 0) parsedFilters.maxPrice = groqResult.maxPrice;

            if (typeof groqResult.minSeats === "number" && groqResult.minSeats > 0) parsedFilters.minSeats = groqResult.minSeats;
            if (typeof groqResult.doors === "number" && groqResult.doors > 0) parsedFilters.doors = groqResult.doors;

            console.log("[Chatbot] Parsed filters:", parsedFilters);

            const hasFilters = parsedFilters.category || parsedFilters.category2 || parsedFilters.search ||
                parsedFilters.fuelType || parsedFilters.transmission ||
                parsedFilters.minPrice !== undefined || parsedFilters.maxPrice !== undefined ||
                parsedFilters.minSeats !== undefined || parsedFilters.doors !== undefined;

            if (!hasFilters) {
                return successResponse(res, "No filters extracted", {
                    intent: "chat",
                    reply: "I'm not sure what vehicle you're looking for. Try something like: \"I need a 7-seater SUV in Kochi under ₹2000\" or \"Show me electric bikes\".",
                    vehicles: [],
                    total: 0,
                });
            }

            // ─── STEP 5: Query vehicles ───────────────────────────────────────────────
            const result = await this._vehicleService.getPublicVehicles(
                1, 10,
                undefined, undefined, undefined, undefined,
                parsedFilters
            );

            if (!result.success) {
                return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
            }

            return successResponse(res, "Found vehicles", {
                intent: "search",
                filters: parsedFilters,
                vehicles: result.data?.data ?? [],
                total: result.data?.total ?? 0,
            });

        } catch (error) {
            console.error("[Chatbot] Error:", error);
            return errorResponse(res, "Internal AI server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
