import { Response } from 'express';

export interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
  cursor?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: ApiMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && process.env.NODE_ENV !== 'production' ? { details } : {}),
    },
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
