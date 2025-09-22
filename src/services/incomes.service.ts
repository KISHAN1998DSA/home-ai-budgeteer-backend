import { prisma } from '@/index';

export const incomesService = {
  async list(userId: string, params: { source?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { source, startDate, endDate, page = 1, limit = 10 } = params;
    const where: any = { userId };
    if (source) where.source = { contains: String(source), mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [incomes, total] = await Promise.all([
      prisma.income.findMany({ where, orderBy: { date: 'desc' }, skip, take: Number(limit) }),
      prisma.income.count({ where })
    ]);
    return { incomes, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } };
  },

  async get(userId: string, id: string) {
    return prisma.income.findFirst({ where: { id, userId } });
  },

  async create(userId: string, data: { source: string; amount: number; date: Date; description?: string }) {
    return prisma.income.create({ data: { ...data, userId } });
  },

  async update(userId: string, id: string, data: { source: string; amount: number; date: Date; description?: string }) {
    const owned = await prisma.income.findFirst({ where: { id, userId } });
    if (!owned) throw new Error('Income not found');
    return prisma.income.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    const owned = await prisma.income.findFirst({ where: { id, userId } });
    if (!owned) throw new Error('Income not found');
    await prisma.income.delete({ where: { id } });
    return true;
  }
};



