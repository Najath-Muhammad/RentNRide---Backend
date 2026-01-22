import type { ICategory } from "../../model/category.model";
import type { IFuelType } from "../../model/fueltype.model";

export interface IAdminCategoryService {
	getAllCategories(
		search?: string,
		page?: number,
		limit?: number,
	): Promise<{
		data: ICategory[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	getCategoryById(id: string): Promise<ICategory>;
	createCategory(data: {
		name: string;
		description?: string;
		subCategories?: any[];
	}): Promise<ICategory>;
	updateCategory(id: string, data: any): Promise<ICategory>;
	toggleCategoryStatus(id: string): Promise<ICategory>;
	getAllFuelTypes(): Promise<IFuelType[]>;
	createFuelType(data: any): Promise<IFuelType>;
	updateFuelType(id: string, data: any): Promise<IFuelType>;
	toggleFuelTypeStatus(id: string): Promise<IFuelType>;
}
