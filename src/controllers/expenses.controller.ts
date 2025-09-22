import { Response, NextFunction } from 'express';
import { expensesService } from '@/services/expenses.service';
import { AuthRequest } from '@/types/request';

export const expensesController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await expensesService.list(req.user!.id, req.query as any);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },
  get: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await expensesService.get(req.user!.id, req.params.id);
      if (!expense) { res.status(404).json({ message: 'Expense not found' }); return; }
      res.json({ success: true, data: expense });
    } catch (e) { next(e); }
  },
  create: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await expensesService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: expense });
    } catch (e) { next(e); }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await expensesService.update(req.user!.id, req.params.id, req.body);
      res.json({ success: true, data: expense });
    } catch (e) { next(e); }
  },
  remove: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await expensesService.remove(req.user!.id, req.params.id);
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (e) { next(e); }
  }
};



