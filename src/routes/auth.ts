import { Router } from 'express';
import { generateToken, generateRefreshToken, protect } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { authController } from '@/controllers/auth.controller';
import { prisma } from '@/index';

const router = Router();

router.post('/signup', validate(schemas.auth.signup), authController.signup);

router.post('/login', validate(schemas.auth.login), authController.login);

router.post('/refresh', validate(schemas.auth.refresh), authController.refresh);

router.post('/logout', protect, authController.logout);

router.post('/reset-password', validate(schemas.auth.resetPassword), async (req, res, next): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });
    // Do not reveal user existence
    res.json({ success: true, message: 'If an account exists, a reset email will be sent.' });
    if (!user) return;
    // TODO: implement OTP/token persistence and email sending
    return;
  } catch (e) { next(e); }
});

export default router;


