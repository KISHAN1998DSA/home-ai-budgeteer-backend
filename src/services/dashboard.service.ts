import { prisma } from '@/index';

export const dashboardService = {
  async summary(userId: string, range?: { startDate?: string; endDate?: string }) {
    const dateFilter: any = { userId };
    if (range?.startDate || range?.endDate) {
      dateFilter.date = {};
      if (range.startDate) dateFilter.date.gte = new Date(range.startDate);
      if (range.endDate) dateFilter.date.lte = new Date(range.endDate);
    } else {
      const now = new Date();
      dateFilter.date = { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
    }

    const [totalIncome, totalExpenses] = await Promise.all([
      prisma.income.aggregate({ where: dateFilter, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: dateFilter, _sum: { amount: true } })
    ]);
    const income = Number(totalIncome._sum.amount) || 0;
    const expenses = Number(totalExpenses._sum.amount) || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const [recentIncomes, recentExpenses] = await Promise.all([
      prisma.income.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5, select: { id: true, source: true, amount: true, date: true, description: true } }),
      prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5, select: { id: true, title: true, amount: true, category: true, date: true, description: true } })
    ]);
    const recent = [...(recentIncomes as any[]).map((r: any) => ({ ...r, type: 'income' })), ...(recentExpenses as any[]).map((r: any) => ({ ...r, type: 'expense' }))]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const expensesByCategory = await prisma.expense.groupBy({ by: ['category'], where: dateFilter, _sum: { amount: true }, _count: { id: true } });
    const incomeBySource = await prisma.income.groupBy({ by: ['source'], where: dateFilter, _sum: { amount: true }, _count: { id: true } });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await Promise.all([
      prisma.income.groupBy({ by: ['date'], where: { userId, date: { gte: sixMonthsAgo } }, _sum: { amount: true } }),
      prisma.expense.groupBy({ by: ['date'], where: { userId, date: { gte: sixMonthsAgo } }, _sum: { amount: true } })
    ]);
    const monthlyTrends: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const month = d.getMonth() + 1; const year = d.getFullYear();
      const inc = (monthlyData[0] as any[]).filter((it: any) => new Date(it.date).getMonth() + 1 === month && new Date(it.date).getFullYear() === year).reduce((s: number, it: any) => s + Number(it._sum.amount), 0);
      const exp = (monthlyData[1] as any[]).filter((it: any) => new Date(it.date).getMonth() + 1 === month && new Date(it.date).getFullYear() === year).reduce((s: number, it: any) => s + Number(it._sum.amount), 0);
      monthlyTrends.push({ month, year, income: inc, expenses: exp, savings: inc - exp });
    }

    return {
      summary: { totalIncome: income, totalExpenses: expenses, netSavings: savings, savingsRate: Math.round(savingsRate * 100) / 100 },
      recentTransactions: recent,
      expensesByCategory: (expensesByCategory as any[]).map((cat: any) => ({ category: cat.category, amount: Number(cat._sum.amount), count: cat._count.id, percentage: expenses > 0 ? (Number(cat._sum.amount) / expenses) * 100 : 0 })),
      incomeBySource: (incomeBySource as any[]).map((source: any) => ({ source: source.source, amount: Number(source._sum.amount), count: source._count.id, percentage: income > 0 ? (Number(source._sum.amount) / income) * 100 : 0 })),
      monthlyTrends
    };
  }
};


