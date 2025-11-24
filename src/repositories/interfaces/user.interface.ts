import { IBaseRepo } from "./base.interface";
import { IUser } from "../../types/IUser";
import { Document } from "mongoose";

export interface IUserRepository extends IBaseRepo<IUser & Document> {

  findAllUsers(filters: any,page: number,limit: number): Promise<{data: (IUser & Document)[];total: number;page: number;limit: number;totalPages: number;}>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailAndUpdate(email:string,password:string):Promise<IUser | null>;
}
