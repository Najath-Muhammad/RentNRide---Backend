
import { IUser } from "../../types/IUser";
import { IUserToAdmin } from "../../types/IUserToAdmin";

export const adminUserDTO = (user: IUser): IUserToAdmin => {
  return {    
    id:user._id,                
    name: user.name,
    email: user.email,
    phone: user.phone,          
    status: user.status,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};