import { IUser } from "../../types/user/IUser";
import { verifyPassword, hashPassword } from "../../utils/password-service.utils";
import { IUserRepository } from "../../repositories/interfaces/user.interface";
import { IUserService } from "../Interfaces/user.interface.service";

export class UserService implements IUserService {
  constructor(private _userRepo: IUserRepository) {}

  async getProfile(userId: string): Promise<Partial<IUser>> {
    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const { password, ...safeUser } = user.toObject ? user.toObject() : user;
      return safeUser;
    } catch (error) {
      // error is unknown by default in strict mode → we narrow it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string }
  ): Promise<any> {  // ← consider replacing `any` with more specific type if possible
    try {
      if (data.name && data.name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      const updated = await this._userRepo.updateById(userId, data);
      if (!updated) {
        throw new Error("Update failed");
      }

      return updated;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async updateProfilePhoto(userId: string, photoUrl: string): Promise<string> {
    try {
      const updated = await this._userRepo.updateById(userId, {
        profilePhoto: photoUrl,
      });

      if (!updated) {
        throw new Error("Photo update failed");
      }

      return photoUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async changePassword(
    userId: string,
    current: string,
    newPass: string
  ): Promise<boolean> {
    try {
      const user = await this._userRepo.findByIdWithPassword(userId);
      if (!user) throw new Error("User not found");

      if (!user.password) {
        throw new Error("User password not set or user not found");
      }

      const isMatch = await verifyPassword(current, user.password);
      if (!isMatch) throw new Error("Current password is incorrect");

      const hashed = await hashPassword(newPass);
      const updated = await this._userRepo.updateById(userId, { password: hashed });

      if (!updated) throw new Error("Password update failed");

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async getSubscriptionStatus(userId: string): Promise<{
    plan: string;
    expiresAt: Date | null;
  }> {
    try {
      const user = await this._userRepo.findById(userId);
      if (!user) throw new Error("User not found");

      return {
        plan: user.role === "premium" ? "premium" : "free",
        expiresAt: user.premiumExpiresAt || null,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async upgradeToPremium(userId: string): Promise<{plan: string;expiresAt: Date | null;}> {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const updated = await this._userRepo.updateById(userId, {
        role: "premium",
        premiumExpiresAt: thirtyDaysFromNow,
      });

      if (!updated) throw new Error("Upgrade failed");

      return this.getSubscriptionStatus(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }
}