import { NextFunction, Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: { id: string; email?: string; name?: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, name: true } });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
};

export const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as Secret, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') } as SignOptions);

export const generateRefreshToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as Secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') } as SignOptions);


