import type { Request, Response } from "express";
import mongoose from "mongoose";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IVehicleService } from "../../services/interfaces/vehicle.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import { rejectReasonSchema } from "../../validations/commonValidation";
import type { IAdminVehicleController } from "../interfaces/iadmin.vehicle.controller";

export class AdminVehicleController implements IAdminVehicleController {
	constructor(private _vehicleService: IVehicleService) { }

	async getAllVehicles(req: Request, res: Response): Promise<Response> {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				category,
				status,
				fuelType,
				owner,
			} = req.query;

			console.log("controller is working", req.query);

			const filters: Record<string, string> = {};

			if (search && String(search).trim() !== "") {
				filters.search = String(search).trim();
			}
			if (category && String(category).trim() !== "") {
				filters.category = String(category).trim();
			}
			if (status && String(status).trim() !== "") {
				filters.status = String(status).trim();
			}
			if (fuelType && String(fuelType).trim() !== "") {
				filters.fuelType = String(fuelType).trim();
			}
			if (owner && String(owner).trim() !== "") {
				filters.owner = String(owner).trim();
			}

			const response = await this._vehicleService.getAllVehicles(
				filters,
				Number(page),
				Number(limit),
			);

			if (!response.success) {
				return errorResponse(res, response.message, HttpStatus.OK);
			}

			return successResponse(res, response.message, response.data);
		} catch (error) {
			console.error("Error in getAllVehicles:", error);
			return errorResponse(
				res,
				"Error in fetching vehicles",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getVehicleStats(_req: Request, res: Response): Promise<Response> {
		try {
			const result = await this._vehicleService.getVehicleStats();

			if (!result.success) {
				return errorResponse(
					res,
					result.message,
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}

			return successResponse(res, "Detailed stats fetched", result.data);
		} catch (error) {
			console.error("Error in getVehicleStats controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async approveVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const result = await this._vehicleService.approveVehicle(id);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.NOT_FOUND);
			}

			return successResponse(res, result.message, result.data);
		} catch (error) {
			console.error("Error in approveVehicle controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async blockVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const result = await this._vehicleService.blockVehicle(id);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.NOT_FOUND);
			}

			return successResponse(res, result.message);
		} catch (error) {
			console.error("Error in blockVehicle controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async unblockVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const result = await this._vehicleService.unblockVehicle(id);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.NOT_FOUND);
			}

			return successResponse(res, result.message);
		} catch (error) {
			console.error("Error in unblockVehicle controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getVehicleById(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			if (!id || !mongoose.Types.ObjectId.isValid(id)) {
				return errorResponse(res, "Invalid vehicle ID", HttpStatus.BAD_REQUEST);
			}

			const result = await this._vehicleService.getVehicleById(id, { userId: "", role: "admin" });

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.NOT_FOUND);
			}

			return successResponse(res, "Vehicle fetched successfully", result.data);
		} catch (error) {
			console.error("Error in getVehicleById controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async rejectVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const parsed = rejectReasonSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { reason } = parsed.data;

			const result = await this._vehicleService.rejectVehicle(
				id,
				reason.trim(),
			);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			return successResponse(res, result.message);
		} catch (error) {
			console.error("Error in rejectVehicle controller:", error);
			return errorResponse(
				res,
				"Server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
