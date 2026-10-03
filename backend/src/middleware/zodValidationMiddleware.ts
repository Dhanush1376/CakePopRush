import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import ApiError from '../utils/ApiError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const firstError = err.errors[0]?.message || 'Validation error';
        return next(new ApiError(400, firstError, 'VALIDATION_ERROR', err.errors));
      }
      next(err);
    }
  };
};

export default validateRequest;
