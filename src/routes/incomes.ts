import { Router } from 'express';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { incomesController } from '@/controllers/incomes.controller';

const router = Router();

router.get('/', protect, validate(schemas.income.list), incomesController.list);

router.get('/:id', protect, validate(schemas.income.idParam), incomesController.get);

router.post('/', protect, validate(schemas.income.createOrUpdate), incomesController.create);

router.put('/:id', protect, validate(schemas.income.idParam), validate(schemas.income.createOrUpdate), incomesController.update);

router.delete('/:id', protect, validate(schemas.income.idParam), incomesController.remove);

export default router;


