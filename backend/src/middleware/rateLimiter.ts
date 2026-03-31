import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later.');
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      429,
      'AUTH_RATE_LIMIT_EXCEEDED',
      'Too many login attempts, please try again in 15 minutes.'
    );
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  skipSuccessfulRequests: true,
});

export const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  handler: (req, res) => {
    sendError(res, 429, 'EXPORT_RATE_LIMIT', 'Export rate limit exceeded. Please wait before exporting again.');
  },
});

export default { apiLimiter, authLimiter, exportLimiter };
