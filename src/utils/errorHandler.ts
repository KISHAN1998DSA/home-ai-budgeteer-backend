import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
};



