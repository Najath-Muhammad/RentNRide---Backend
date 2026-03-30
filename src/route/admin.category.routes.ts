import { Router } from "express";
import { AdminCategoryController } from "../controller/Implementation/admin.category.controller";
import { CategoryRepository } from "../repositories/Implementation/category.repository";
import { FuelTypeRepository } from "../repositories/Implementation/fueltype.repository";
import { AdminCategoryService } from "../services/Implementation/admin.category.service";

const categoryRouter = Router();

const categoryRepo = new CategoryRepository();
const fuelTypeRepo = new FuelTypeRepository();
const adminCategoryService = new AdminCategoryService(
	categoryRepo,
	fuelTypeRepo,
);
const adminCategoryController = new AdminCategoryController(
	adminCategoryService,
);

categoryRouter.get(
	"/categories",
	adminCategoryController.getAllCategories.bind(adminCategoryController),
);
categoryRouter.get(
	"/categories/:id",
	adminCategoryController.getCategoryById.bind(adminCategoryController),
);
categoryRouter.post(
	"/categories",
	adminCategoryController.createCategory.bind(adminCategoryController),
);
categoryRouter.put(
	"/categories/:id",
	adminCategoryController.updateCategory.bind(adminCategoryController),
);
categoryRouter.patch(
	"/categories/:id/toggle",
	adminCategoryController.toggleCategoryStatus.bind(adminCategoryController),
);

categoryRouter.get(
	"/fuel-types",
	adminCategoryController.getAllFuelTypes.bind(adminCategoryController),
);
categoryRouter.post(
	"/fuel-types",
	adminCategoryController.createFuelType.bind(adminCategoryController),
);
categoryRouter.put(
	"/fuel-types/:id",
	adminCategoryController.updateFuelType.bind(adminCategoryController),
);
categoryRouter.patch(
	"/fuel-types/:id/toggle",
	adminCategoryController.toggleFuelTypeStatus.bind(adminCategoryController),
);

export default categoryRouter;
