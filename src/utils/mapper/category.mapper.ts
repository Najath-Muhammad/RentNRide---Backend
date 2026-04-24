import type { ICategory } from "../../model/category.model";
import type { IFuelType } from "../../model/fueltype.model";
export const categoryDTO = (category: ICategory): Partial<ICategory> => {
	return {
		_id: category._id,
		name: category.name,
		description: category.description,
		isActive: category.isActive,
		subCategories: category.subCategories,
		createdAt: category.createdAt,
		updatedAt: category.updatedAt,
	};
};

export const fuelTypeDTO = (fuelType: IFuelType): Partial<IFuelType> => {
	return {
		_id: fuelType._id,
		name: fuelType.name,
		isActive: fuelType.isActive,
		createdAt: fuelType.createdAt,
		updatedAt: fuelType.updatedAt,
	};
};
