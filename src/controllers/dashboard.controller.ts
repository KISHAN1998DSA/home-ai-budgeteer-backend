import { Response, NextFunction } from 'express';
import { dashboardService } from '@/services/dashboard.service';
import { AuthRequest } from '@/types/request';

export const dashboardController = {
  summary: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.summary(req.user!.id, req.query as any);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
};



