import { Router } from 'express';
import { prisma } from '@/index';
import { protect, AuthRequest } from '@/middleware/auth';
import { validate, schemas } from '@/middleware/validation';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.get('/suggestions', protect, async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const [expenses, incomes] = await Promise.all<any>([
      prisma.expense.findMany({ where: { userId, date: { gte: firstDay, lte: lastDay } } }),
      prisma.income.findMany({ where: { userId, date: { gte: firstDay, lte: lastDay } } })
    ]);
    const totalIncome = (incomes as any[]).reduce((s: number, i: any) => s + Number(i.amount), 0);
    const totalExpenses = (expenses as any[]).reduce((s: number, e: any) => s + Number(e.amount), 0);
    const expensesByCategory = (expenses as any[]).reduce((acc: Record<string, number>, e: any) => {
      const key = String(e.category);
      acc[key] = (acc[key] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    if (!process.env.GEMINI_API_KEY) {
      res.json({ success: true, data: [{ message: 'AI key not configured. Basic summary only.', totalIncome, totalExpenses, expensesByCategory }] });
      return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this monthly spending: income=${totalIncome}, expenses=${totalExpenses}. Categories: ${JSON.stringify(expensesByCategory)}. Give 4 concise insights.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ success: true, data: text });
    return;
  } catch (e) { next(e); }
});

router.post('/categorize-expense', protect, validate(schemas.ai.categorize), async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const { title, description, amount } = req.body as any;
    if (!process.env.GEMINI_API_KEY) { res.status(400).json({ message: 'AI not configured' }); return; }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Categorize expense with categories [FOOD, RENT, UTILITIES, TRANSPORTATION, HEALTHCARE, ENTERTAINMENT, SHOPPING, TRAVEL, EDUCATION, INSURANCE, SAVINGS, OTHER]. Title: ${title}. Description: ${description ?? 'N/A'}. Amount: ${amount}. Return JSON {category, reason}.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ success: true, data: text });
    return;
  } catch (e) { next(e); }
});

export default router;


