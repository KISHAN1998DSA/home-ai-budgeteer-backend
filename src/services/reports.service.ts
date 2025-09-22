import { prisma } from '@/index';

export const reportsService = {
  async createMonthly(userId: string, month: number, year: number) {
    const existing = await prisma.report.findFirst({ where: { userId, month, year } });
    if (existing) return existing;
    return prisma.report.create({ data: { userId, month, year, fileUrl: null } });
  },
  async list(userId: string, page = 1, limit = 10) {
    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      prisma.report.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
      prisma.report.count({ where: { userId } })
    ]);
    return { reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } };
  },
  async get(userId: string, id: string) {
    return prisma.report.findFirst({ where: { id, userId } });
  },
  async remove(userId: string, id: string) {
    const report = await prisma.report.findFirst({ where: { id, userId } });
    if (!report) throw new Error('Report not found');
    await prisma.report.delete({ where: { id } });
    return true;
  }
};



