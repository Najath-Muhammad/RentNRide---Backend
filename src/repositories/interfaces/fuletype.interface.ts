import type { Document } from "mongoose";
import type { IFuelType } from "../../model/fueltype.model";

export interface IFueltypeRepository {
	findAll(): Promise<(IFuelType & Document)[]>;
	findById(id: string): Promise<(IFuelType & Document) | null>;
	create(data: Partial<IFuelType>): Promise<IFuelType & Document>;
	updateById(
		id: string,
		update: Partial<IFuelType>,
	): Promise<(IFuelType & Document) | null>;
	toggleActive(id: string): Promise<(IFuelType & Document) | null>;
}
