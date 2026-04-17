import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import { MESSAGES } from "../../constants/messages/messageConstants";
import type { ICategory } from "../../model/category.model";
import type { IFuelType } from "../../model/fueltype.model";
import type { IAdminCategoryService } from "../../services/interfaces/admin.category.interface.service";
import { categoryDTO, fuelTypeDTO } from "../../utils/mapper/category.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	createCategorySchema,
	fuelTypeSchema,
	updateCategorySchema,
	updateFuelTypeSchema,
} from "../../validations/commonValidation";
import type { IAdminCategoryController } from "../interfaces/iadmin.category.controller";

export class AdminCategoryController implements IAdminCategoryController {
	constructor(private adminService: IAdminCategoryService) {}

	async getAllCategories(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const search = req.query.search as string;
			const result = await this.adminService.getAllCategories(
				search,
				page,
				limit,
			);
			const mappedResult = {
				...result,
				data: result.data.map((cat: ICategory) => categoryDTO(cat)),
			};
			return successResponse(
				res,
				"Categories fetched successfully",
				mappedResult,
			);
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
			return successResponse(
				res,
				"Category fetched successfully",
				categoryDTO(category),
			);
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
			const parsed = createCategorySchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { name, description, subCategories } = parsed.data;

			const category = await this.adminService.createCategory({
				name,
				description,
				subCategories,
			});
			return successResponse(
				res,
				"Category created successfully",
				categoryDTO(category),
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
			const parsed = updateCategorySchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const category = await this.adminService.updateCategory(
				req.params.id,
				parsed.data,
			);
			return successResponse(
				res,
				"Category updated successfully",
				categoryDTO(category),
			);
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
			return successResponse(
				res,
				"Category status updated",
				categoryDTO(category),
			);
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
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const fuelTypes = await this.adminService.getAllFuelTypes();
			return successResponse(
				res,
				"Fuel types fetched successfully",
				fuelTypes.map((f: IFuelType) => fuelTypeDTO(f)),
			);
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
			const parsed = fuelTypeSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}

			const fuel = await this.adminService.createFuelType(req.body);
			return successResponse(
				res,
				"Fuel type created successfully",
				fuelTypeDTO(fuel),
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
			const parsed = updateFuelTypeSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const fuel = await this.adminService.updateFuelType(
				req.params.id,
				parsed.data,
			);
			return successResponse(
				res,
				"Fuel type updated successfully",
				fuelTypeDTO(fuel),
			);
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
			return successResponse(
				res,
				"Fuel type status updated",
				fuelTypeDTO(fuel),
			);
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
