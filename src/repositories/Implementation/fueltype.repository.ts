import type { Document } from "mongoose";
import type { IFuelType } from "../../model/fueltype.model";
import { FuelType } from "../../model/fueltype.model";
import type { IFueltypeRepository } from "../interfaces/fuletype.interface";

export class FuelTypeRepository implements IFueltypeRepository {
	async findAll(): Promise<(IFuelType & Document)[]> {
		return FuelType.find({}).sort({ name: 1 }).exec();
	}

	async findById(id: string): Promise<(IFuelType & Document) | null> {
		return FuelType.findById(id).exec();
	}

	async create(data: Partial<IFuelType>): Promise<IFuelType & Document> {
		return FuelType.create(data);
	}

	async updateById(
		id: string,
		update: Partial<IFuelType>,
	): Promise<(IFuelType & Document) | null> {
		return FuelType.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		}).exec();
	}

	async toggleActive(id: string): Promise<(IFuelType & Document) | null> {
		const fuel = await FuelType.findById(id);
		if (!fuel) return null;
		fuel.isActive = !fuel.isActive;
		await fuel.save();
		return fuel;
	}
}
