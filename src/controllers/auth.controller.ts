import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

export const authController = {
  signup: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as any;
      const result = await authService.signup(name, email, password);
      res.status(201).json({ success: true, data: result });
    } catch (e) { next(e); }
  },
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as any;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },
  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as any;
      const result = await authService.refresh(refreshToken);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as any;
      await authService.logout(refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (e) { next(e); }
  }
};



