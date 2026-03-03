import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const createLimiter = (max: number) => {
  if (process.env.NODE_ENV === 'test') {
    return (req: Request, res: Response, next: NextFunction) => next();
  }
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    message: { error: 'Too many requests, please try again later' }
  });
};

export const sensitiveLimiter = createLimiter(20);
export const uploadLimiter = createLimiter(30);