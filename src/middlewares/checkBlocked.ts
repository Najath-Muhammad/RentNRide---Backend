import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '../repositories/interfaces/user.interface';
import  logger  from '../utils/logger';

export const checkBlocked = (userRepository: IUserRepository) => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await userRepository.findById(userId);

      if (user?.isBlocked) {
        logger.warn(`Blocked user access attempt: ${userId}`);
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Contact support.',
        });
      }

      next();
    } catch (error) {
      logger.error('checkBlocked middleware error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};