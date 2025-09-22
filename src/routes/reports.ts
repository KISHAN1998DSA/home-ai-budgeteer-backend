import { Router } from 'express';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { reportsController } from '@/controllers/reports.controller';

const router = Router();

router.post('/monthly', protect, validate(schemas.reports.monthly), reportsController.createMonthly);

router.get('/', protect, reportsController.list);

router.get('/:id', protect, validate(schemas.reports.idParam), reportsController.get);

router.delete('/:id', protect, validate(schemas.reports.idParam), reportsController.remove);

export default router;


