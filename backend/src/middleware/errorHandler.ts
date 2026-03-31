import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ZodError - validation failure
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', details);
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = (err.meta?.target as string[]) || [];
        sendError(
          res,
          409,
          'CONFLICT',
          `A record with this ${fields.join(', ')} already exists`
        );
        return;
      }
      case 'P2025':
        sendError(res, 404, 'NOT_FOUND', 'Record not found');
        return;
      case 'P2003':
        sendError(res, 400, 'FOREIGN_KEY_ERROR', 'Related record not found');
        return;
      default:
        logger.error(`Prisma error ${err.code}: ${err.message}`);
        sendError(res, 500, 'DATABASE_ERROR', 'A database error occurred');
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, 'DATABASE_VALIDATION_ERROR', 'Invalid data provided');
    return;
  }

  // JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    sendError(res, 401, 'TOKEN_EXPIRED', 'Token has expired');
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    sendError(res, 401, 'INVALID_TOKEN', 'Invalid token');
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(`Non-operational error: ${err.message}`, { stack: err.stack });
    }
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Generic error - don't leak details in production
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message;

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`);
}

export default errorHandler;
