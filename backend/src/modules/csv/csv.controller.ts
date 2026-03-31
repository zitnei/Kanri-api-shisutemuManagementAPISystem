import { Request, Response } from 'express';
import * as csvService from './csv.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { z } from 'zod';

const usersExportQuery = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

const auditExportQuery = z.object({
  dateFrom: z.string().optional().transform(v => v ? new Date(v) : undefined),
  dateTo: z.string().optional().transform(v => v ? new Date(v) : undefined),
});

export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = usersExportQuery.parse(req.query);

  const csv = await csvService.exportUsers({
    search: query.search,
    departmentId: query.departmentId,
    isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="users_export_${Date.now()}.csv"`);
  res.send(csv);
});

export const exportAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = auditExportQuery.parse(req.query);

  const csv = await csvService.exportAuditLogs({
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
  res.send(csv);
});
