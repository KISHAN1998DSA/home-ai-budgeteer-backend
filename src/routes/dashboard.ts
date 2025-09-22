import { Router } from 'express';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { dashboardController } from '@/controllers/dashboard.controller';

const router = Router();

router.get('/', protect, validate(schemas.dashboard.range), dashboardController.summary);

export default router;


