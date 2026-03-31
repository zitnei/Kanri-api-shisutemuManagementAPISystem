import { Request, Response } from 'express';
import * as auditLogsService from './audit-logs.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { z } from 'zod';

const listQuerySchema = z.object({
  userId: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional().transform(v => v ? new Date(v) : undefined),
  dateTo: z.string().optional().transform(v => v ? new Date(v) : undefined),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
});

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = listQuerySchema.parse(req.query);
  const result = await auditLogsService.findMany(query);

  sendSuccess(res, result.items, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const getDistinctResources = asyncHandler(async (_req: Request, res: Response) => {
  const resources = await auditLogsService.getDistinctResources();
  sendSuccess(res, resources);
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const activity = await auditLogsService.getRecentActivity(limit);
  sendSuccess(res, activity);
});
