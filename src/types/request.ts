import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string; email?: string; name?: string };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}



