import { IUser } from "../../types/user/IUser";

export interface IUserService {
  getProfile(userId: string): Promise<Partial<IUser>>;
  updateProfile(userId: string, data: { name?: string; phone?: string }): Promise<IUser>;
  updateProfilePhoto(userId: string, photoUrl: string): Promise<string>;
  changePassword(userId: string, current: string, newPass: string): Promise<boolean>;
  getSubscriptionStatus(userId: string): Promise<{ plan: string; expiresAt: Date | null }>;
  upgradeToPremium(userId: string): Promise<{ plan: string; expiresAt: Date | null }>;
}