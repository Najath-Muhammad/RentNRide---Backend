import type { Document, FilterQuery } from "mongoose";
import type { IUser } from "../../types/user/IUser";
import type { IBaseRepo } from "./base.interface";

export interface IUserRepository extends IBaseRepo<IUser & Document> {
	findByIdSub(userId: string): any;
	findAllUsers(
		filters: FilterQuery<IUser>,
		page: number,
		limit: number,
	): Promise<{
		data: (IUser & Document)[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	findByEmail(email: string): Promise<IUser | null>;
	findByEmailAndUpdate(email: string, password: string): Promise<IUser | null>;
	findByIdWithPassword(id: string): Promise<(IUser & Document) | null>;
}
