import { Response, NextFunction } from 'express';
import { incomesService } from '@/services/incomes.service';
import { AuthRequest } from '@/types/request';

export const incomesController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await incomesService.list(req.user!.id, req.query as any);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },
  get: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const income = await incomesService.get(req.user!.id, req.params.id);
      if (!income) { res.status(404).json({ message: 'Income not found' }); return; }
      res.json({ success: true, data: income });
    } catch (e) { next(e); }
  },
  create: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const income = await incomesService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: income });
    } catch (e) { next(e); }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const income = await incomesService.update(req.user!.id, req.params.id, req.body);
      res.json({ success: true, data: income });
    } catch (e) { next(e); }
  },
  remove: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await incomesService.remove(req.user!.id, req.params.id);
      res.json({ success: true, message: 'Income deleted successfully' });
    } catch (e) { next(e); }
  }
};



