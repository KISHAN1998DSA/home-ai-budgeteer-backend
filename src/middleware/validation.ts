import { NextFunction, Request, Response } from 'express';
import { ZodSchema, z, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    const parsed = schema.parse({ body: req.body, query: req.query, params: req.params }) as any;
    if (parsed?.body) req.body = parsed.body;
    if (parsed?.query) req.query = parsed.query;
    if (parsed?.params) req.params = parsed.params;
    next();
    return;
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (err.issues || []).map((e: any) => ({ path: Array.isArray(e.path) ? e.path.join('.') : String(e.path), message: e.message }))
      });
      return;
    }
    next(err as any);
  }
};

export const schemas = {
  auth: {
    signup: z.object({
      body: z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        password: z.string().min(6).max(128)
      })
    }),
    login: z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6)
      })
    }),
    refresh: z.object({
      body: z.object({
        refreshToken: z.string().min(1)
      })
    }),
    resetPassword: z.object({
      body: z.object({
        email: z.string().email()
      })
    })
  },
  expense: {
    createOrUpdate: z.object({
      body: z.object({
        title: z.string().min(1).max(100),
        amount: z.coerce.number().positive(),
        category: z.enum(['FOOD','RENT','UTILITIES','TRANSPORTATION','HEALTHCARE','ENTERTAINMENT','SHOPPING','TRAVEL','EDUCATION','INSURANCE','SAVINGS','OTHER']),
        date: z.coerce.date(),
        description: z.string().max(500).optional()
      })
    }),
    list: z.object({
      query: z.object({
        category: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
      })
    }),
    idParam: z.object({ params: z.object({ id: z.string().uuid() }) })
  },
  income: {
    createOrUpdate: z.object({
      body: z.object({
        source: z.string().min(1).max(100),
        amount: z.coerce.number().positive(),
        date: z.coerce.date(),
        description: z.string().max(500).optional()
      })
    }),
    list: z.object({
      query: z.object({
        source: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
      })
    }),
    idParam: z.object({ params: z.object({ id: z.string().uuid() }) })
  },
  dashboard: {
    range: z.object({
      query: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
      })
    })
  },
  reports: {
    monthly: z.object({
      body: z.object({
        month: z.coerce.number().int().min(1).max(12),
        year: z.coerce.number().int().min(2000).max(2100)
      })
    }),
    idParam: z.object({ params: z.object({ id: z.string().uuid() }) })
  },
  user: {
    updateProfile: z.object({
      body: z.object({ name: z.string().min(1).max(100).optional(), email: z.string().email().optional() })
    }),
    updatePreferences: z.object({
      body: z.object({
        emailNotifications: z.boolean().optional(),
        currency: z.string().min(1).max(10).optional(),
        timezone: z.string().min(1).max(64).optional()
      }).passthrough()
    })
  },
  ai: {
    categorize: z.object({
      body: z.object({ title: z.string().min(1), amount: z.coerce.number().positive(), description: z.string().optional() })
    })
  }
};


