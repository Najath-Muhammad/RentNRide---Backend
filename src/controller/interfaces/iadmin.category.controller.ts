import type { NextFunction, Request, Response } from "express";

export interface IAdminCategoryController {
	getAllCategories(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	getCategoryById(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	createCategory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	updateCategory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	toggleCategoryStatus(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;

	getAllFuelTypes(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	createFuelType(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	updateFuelType(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
	toggleFuelTypeStatus(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response>;
}
