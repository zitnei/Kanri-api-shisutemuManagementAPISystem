import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'No token provided');
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 401, 'INVALID_TOKEN', 'Invalid access token');
      return;
    }
    sendError(res, 401, 'UNAUTHORIZED', 'Authentication failed');
  }
}

export default authenticate;
