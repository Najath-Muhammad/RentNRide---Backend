import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import { MESSAGES } from "../../constants/messages/messageConstants";
import type { IAdminCategoryService } from "../../services/Interfaces/admin.category.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IAdminCategoryController } from "../interfaces/iadmin.category.controller";

export class AdminCategoryController implements IAdminCategoryController {
	constructor(private adminService: IAdminCategoryService) {}

	async getAllCategories(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const search = req.query.search as string;
			const result = await this.adminService.getAllCategories(
				search,
				page,
				limit,
			);
			return successResponse(res, "Categories fetched successfully", result);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error
					? error.message
					: MESSAGES.ERRORS.SERVER_ERROR || "Unknown error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getCategoryById(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const category = await this.adminService.getCategoryById(req.params.id);
			return successResponse(res, "Category fetched successfully", category);
		} catch (error) {
			next(error);
			const message = error instanceof Error ? error.message : "Unknown error";
			const status = message.includes("not found")
				? HttpStatus.NOT_FOUND
				: HttpStatus.INTERNAL_SERVER_ERROR;
			return errorResponse(res, message, status);
		}
	}

	async createCategory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { name, description, subCategories } = req.body;

			if (!name?.trim()) {
				return errorResponse(
					res,
					"Category name is required",
					HttpStatus.BAD_REQUEST,
				);
			}

			const category = await this.adminService.createCategory({
				name,
				description,
				subCategories,
			});
			return successResponse(
				res,
				"Category created successfully",
				category,
				HttpStatus.CREATED,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Unknown error",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async updateCategory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const category = await this.adminService.updateCategory(
				req.params.id,
				req.body,
			);
			return successResponse(res, "Category updated successfully", category);
		} catch (error) {
			next(error);
			const message = error instanceof Error ? error.message : "Unknown error";
			const status = message.includes("not found")
				? HttpStatus.NOT_FOUND
				: HttpStatus.BAD_REQUEST;
			return errorResponse(res, message, status);
		}
	}

	async toggleCategoryStatus(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const category = await this.adminService.toggleCategoryStatus(
				req.params.id,
			);
			return successResponse(res, "Category status updated", category);
		} catch (error) {
			next(error);
			const message = error instanceof Error ? error.message : "Unknown error";
			const status = message.includes("not found")
				? HttpStatus.NOT_FOUND
				: HttpStatus.INTERNAL_SERVER_ERROR;
			return errorResponse(res, message, status);
		}
	}

	// ────────────────────────────────────────────────
	// Fuel Types
	// ────────────────────────────────────────────────

	async getAllFuelTypes(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const fuelTypes = await this.adminService.getAllFuelTypes();
			return successResponse(res, "Fuel types fetched successfully", fuelTypes);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error
					? error.message
					: MESSAGES.ERRORS.SERVER_ERROR || "Unknown error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createFuelType(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const { name } = req.body;

			if (!name?.trim()) {
				return errorResponse(
					res,
					"Fuel type name is required",
					HttpStatus.BAD_REQUEST,
				);
			}

			const fuel = await this.adminService.createFuelType(req.body);
			return successResponse(
				res,
				"Fuel type created successfully",
				fuel,
				HttpStatus.CREATED,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Unknown error",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async updateFuelType(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const fuel = await this.adminService.updateFuelType(
				req.params.id,
				req.body,
			);
			return successResponse(res, "Fuel type updated successfully", fuel);
		} catch (error) {
			next(error);
			const message = error instanceof Error ? error.message : "Unknown error";
			const status = message.includes("not found")
				? HttpStatus.NOT_FOUND
				: HttpStatus.BAD_REQUEST;
			return errorResponse(res, message, status);
		}
	}

	async toggleFuelTypeStatus(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const fuel = await this.adminService.toggleFuelTypeStatus(req.params.id);
			return successResponse(res, "Fuel type status updated", fuel);
		} catch (error) {
			next(error);
			const message = error instanceof Error ? error.message : "Unknown error";
			const status = message.includes("not found")
				? HttpStatus.NOT_FOUND
				: HttpStatus.INTERNAL_SERVER_ERROR;
			return errorResponse(res, message, status);
		}
	}
}
