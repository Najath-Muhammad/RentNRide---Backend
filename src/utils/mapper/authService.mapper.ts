import { ISafeUser } from "../../types/ISafeUser";
import { IUser } from "../../types/IUser";

export const userDTO = (user: IUser):ISafeUser => {
  return {
    _id:user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,        
    address: user.address,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isBlocked: user.isBlocked,
  };
};

