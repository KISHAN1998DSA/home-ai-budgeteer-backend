import bcrypt from 'bcryptjs';
import { prisma } from '@/index';
import { generateToken, generateRefreshToken } from '@/middleware/auth';

export const authService = {
  async signup(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User already exists');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, preferences: { emailNotifications: true, currency: 'USD', timezone: 'UTC' } },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
    return { user, token, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
    return { user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }, token, refreshToken };
  },

  async refresh(refreshToken: string) {
    const found = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!found || found.expiresAt < new Date()) throw new Error('Invalid or expired refresh token');
    const token = generateToken(found.userId);
    return { token };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return true;
  }
};



