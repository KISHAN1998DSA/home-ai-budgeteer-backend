import { Router } from 'express';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { expensesController } from '@/controllers/expenses.controller';

const router = Router();

router.get('/', protect, validate(schemas.expense.list), expensesController.list);

router.get('/:id', protect, validate(schemas.expense.idParam), expensesController.get);

router.post('/', protect, validate(schemas.expense.createOrUpdate), expensesController.create);

router.put('/:id', protect, validate(schemas.expense.idParam), validate(schemas.expense.createOrUpdate), expensesController.update);

router.delete('/:id', protect, validate(schemas.expense.idParam), expensesController.remove);

export default router;


