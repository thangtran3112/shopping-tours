import { Request, Response, NextFunction } from 'express';
import { AppRequest } from './types';

export const catchAsync = (
  fn: (req: Request | AppRequest, res: Response, next: NextFunction) => any,
) => {
  return (req: Request | AppRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
