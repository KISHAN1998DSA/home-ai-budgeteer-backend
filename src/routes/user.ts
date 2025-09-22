import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/index';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';

const router = Router();

router.get('/profile', protect, async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, preferences: true, createdAt: true, updatedAt: true } });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ success: true, data: user });
    return;
  } catch (e) { next(e); }
});

router.put('/profile', protect, validate(schemas.user.updateProfile), async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const { name, email } = req.body as any;
    if (email) {
      const exists = await prisma.user.findFirst({ where: { email, id: { not: req.user!.id } } });
      if (exists) { res.status(400).json({ message: 'Email is already taken' }); return; }
    }
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { ...(name && { name }), ...(email && { email }) }, select: { id: true, name: true, email: true, preferences: true, createdAt: true, updatedAt: true } });
    res.json({ success: true, data: user });
    return;
  } catch (e) { next(e); }
});

router.put('/preferences', protect, validate(schemas.user.updatePreferences), async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const current = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { preferences: true } });
    if (!current) { res.status(404).json({ message: 'User not found' }); return; }
    const updated = await prisma.user.update({ where: { id: req.user!.id }, data: { preferences: { ...(current.preferences as any || {}), ...(req.body as any) } }, select: { id: true, name: true, email: true, preferences: true, createdAt: true, updatedAt: true } });
    res.json({ success: true, data: updated });
    return;
  } catch (e) { next(e); }
});

router.put('/change-password', protect, async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as any;
    if (!currentPassword || !newPassword) { res.status(400).json({ message: 'Current password and new password are required' }); return; }
    if (String(newPassword).length < 6) { res.status(400).json({ message: 'New password must be at least 6 characters long' }); return; }
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { passwordHash: true } });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) { res.status(400).json({ message: 'Current password is incorrect' }); return; }
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: hash } });
    res.json({ success: true, message: 'Password changed successfully' });
    return;
  } catch (e) { next(e); }
});

router.delete('/account', protect, async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const { password } = req.body as any;
    if (!password) { res.status(400).json({ message: 'Password is required to delete account' }); return; }
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { passwordHash: true } });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) { res.status(400).json({ message: 'Password is incorrect' }); return; }
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ success: true, message: 'Account deleted successfully' });
    return;
  } catch (e) { next(e); }
});

export default router;


