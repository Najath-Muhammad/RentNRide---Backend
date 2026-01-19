import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IVehicleService } from "../../services/Interfaces/vehicle.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IVehicleController } from "../interfaces/ivehicle.controller";

export class VehicleController implements IVehicleController {
	constructor(private _vehicleService: IVehicleService) { }

	async createVehicle(req: Request, res: Response, _next: NextFunction,): Promise<Response> {
		try {
			const user = req.user;
			console.log("user in the create controller is: ", user);
			if (!user) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const VehicleData = req.body;

			const _response = await this._vehicleService.createVehicle({
				ownerId: user.userId,
				...VehicleData,
			});

			return successResponse(
				res,
				"Vehicle Created Successfully, Waiting for admins Approval",
				undefined,
				HttpStatus.OK,
			);
		} catch (error) {
			console.log(error);
			return errorResponse(
				res,
				String(error),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

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

			return successResponse(res, "Stats fetched", result.data);
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

			const result = await this._vehicleService.getVehicleById(id, true);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.NOT_FOUND);
			}

			if (!result.data) {
				return errorResponse(
					res,
					"Vehicle data not found",
					HttpStatus.NOT_FOUND,
				);
			}
			return successResponse(res, "Vehicle fetched", result.data);
		} catch (error) {
			console.error("Error in getVehicleById controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getPublicVehicles(req: Request, res: Response): Promise<Response> {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50); // Max 50
			const lat = req.query.lat
				? parseFloat(req.query.lat as string)
				: undefined;
			const lon = req.query.lon
				? parseFloat(req.query.lon as string)
				: undefined;
			const range = req.query.range
				? parseInt(req.query.range as string, 10)
				: undefined;

			const result = await this._vehicleService.getPublicVehicles(
				page,
				limit,
				lat,
				lon,
				range,
			);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			if (!result.data) {
				return successResponse(res, "Public vehicles fetched", result.data);
			}

			return successResponse(res, "Public vehicles fetched", result.data);
		} catch (error) {
			console.error("Error in getPublicVehicles controller:", error);
			return errorResponse(
				res,
				"Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getMyVehicles(req: Request, res: Response): Promise<Response> {
		console.log("this controller is working");
		try {
			const ownerId = req.user;
			console.log("owner id is: ", ownerId);
			if (!ownerId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const result = await this._vehicleService.getMyVehicles(ownerId.userId);
			console.log("response is : ", result);
			if (!result.success) {
				return errorResponse(
					res,
					result.message,
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}

			if (!result.vehicles) {
				return successResponse(res, "Vehicles fetched successfully", {
					vehicles: [],
				});
			}

			return successResponse(res, "Vehicles fetched successfully", {
				vehicles: result.vehicles,
			});
		} catch (error) {
			console.error("Error in getMyVehicles controller:", error);
			return errorResponse(
				res,
				"Server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async rejectVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const { reason } = req.body;

			if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
				return errorResponse(
					res,
					"Rejection reason is required and should be at least 10 characters",
					HttpStatus.BAD_REQUEST,
				);
			}

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

	async updateVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const ownerId = req.user?.userId;
			const updates = req.body;

			if (!ownerId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}

			const result = await this._vehicleService.updateVehicle(
				id,
				ownerId,
				updates,
			);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			return successResponse(res, result.message);
		} catch (error) {
			console.error("Error in updateVehicle:", error);
			return errorResponse(
				res,
				"Server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteVehicle(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const ownerId = req.user?.userId;

			if (!ownerId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}

			const result = await this._vehicleService.deleteVehicle(id, ownerId);

			if (!result.success) {
				return errorResponse(res, result.message, HttpStatus.BAD_REQUEST);
			}

			return successResponse(res, result.message);
		} catch (error) {
			console.error("Error in deleteVehicle controller:", error);
			return errorResponse(
				res,
				"Server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
