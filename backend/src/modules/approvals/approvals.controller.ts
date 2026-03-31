import { Request, Response } from 'express';
import * as approvalsService from './approvals.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { z } from 'zod';

const createApprovalSchema = z.object({
  approverId: z.string().optional(),
  type: z.enum(['VACATION', 'EXPENSE', 'OVERTIME', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  endDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  amount: z.number().positive().optional(),
  fileUrl: z.string().url().optional(),
});

const reviewSchema = z.object({
  comment: z.string().max(1000).optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  type: z.enum(['VACATION', 'EXPENSE', 'OVERTIME', 'OTHER']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export const listApprovals = asyncHandler(async (req: Request, res: Response) => {
  const query = listQuerySchema.parse(req.query);
  const result = await approvalsService.findMany({
    status: query.status,
    type: query.type,
    userId: req.user!.sub,
    userRole: req.user!.role,
    page: query.page,
    limit: query.limit,
  });

  sendSuccess(res, result.items, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const getApproval = asyncHandler(async (req: Request, res: Response) => {
  const approval = await approvalsService.findById(req.params.id, req.user!.sub, req.user!.role);
  sendSuccess(res, approval);
});

export const createApproval = asyncHandler(async (req: Request, res: Response) => {
  const body = createApprovalSchema.parse(req.body);
  const approval = await approvalsService.create({
    ...body,
    requesterId: req.user!.sub,
  });
  sendCreated(res, approval);
});

export const approveRequest = asyncHandler(async (req: Request, res: Response) => {
  const body = reviewSchema.parse(req.body);
  const approval = await approvalsService.approve(req.params.id, req.user!.sub, body.comment);
  sendSuccess(res, approval);
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const body = reviewSchema.parse(req.body);
  const approval = await approvalsService.reject(req.params.id, req.user!.sub, body.comment);
  sendSuccess(res, approval);
});

export const cancelRequest = asyncHandler(async (req: Request, res: Response) => {
  await approvalsService.cancel(req.params.id, req.user!.sub);
  sendNoContent(res);
});

export const getStatusSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await approvalsService.getStatusSummary();
  sendSuccess(res, summary);
});
