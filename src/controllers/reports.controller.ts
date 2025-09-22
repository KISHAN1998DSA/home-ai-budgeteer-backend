import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types/request';
import { reportsService } from '@/services/reports.service';

export const reportsController = {
  createMonthly: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { month, year } = req.body as any;
      const report = await reportsService.createMonthly(req.user!.id, month, year);
      res.status(201).json({ success: true, data: report });
    } catch (e) { next(e); }
  },
  list: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query as any;
      const data = await reportsService.list(req.user!.id, Number(page), Number(limit));
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },
  get: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.get(req.user!.id, req.params.id);
      if (!report) { res.status(404).json({ message: 'Report not found' }); return; }
      res.json({ success: true, data: report });
    } catch (e) { next(e); }
  },
  remove: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await reportsService.remove(req.user!.id, req.params.id);
      res.json({ success: true, message: 'Report deleted successfully' });
    } catch (e) { next(e); }
  }
};



