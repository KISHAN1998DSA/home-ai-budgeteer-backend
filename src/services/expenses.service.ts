import { prisma } from '@/index';

export const expensesService = {
  async list(userId: string, params: { category?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { category, startDate, endDate, page = 1, limit = 10 } = params;
    const where: any = { userId };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({ where, orderBy: { date: 'desc' }, skip, take: Number(limit) }),
      prisma.expense.count({ where })
    ]);
    return { expenses, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } };
  },

  async get(userId: string, id: string) {
    return prisma.expense.findFirst({ where: { id, userId } });
  },

  async create(userId: string, data: { title: string; amount: number; category: string; date: Date; description?: string }) {
    return prisma.expense.create({ data: { ...data, userId } });
  },

  async update(userId: string, id: string, data: { title: string; amount: number; category: string; date: Date; description?: string }) {
    const owned = await prisma.expense.findFirst({ where: { id, userId } });
    if (!owned) throw new Error('Expense not found');
    return prisma.expense.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    const owned = await prisma.expense.findFirst({ where: { id, userId } });
    if (!owned) throw new Error('Expense not found');
    await prisma.expense.delete({ where: { id } });
    return true;
  }
};



