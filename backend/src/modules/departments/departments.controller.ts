import { Request, Response } from 'express';
import * as departmentsService from './departments.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { z } from 'zod';

const createDeptSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  parentId: z.string().optional(),
  managerId: z.string().optional(),
});

const updateDeptSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listDepartments = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const depts = await departmentsService.findAll(includeInactive);
  sendSuccess(res, depts);
});

export const getDepartmentTree = asyncHandler(async (_req: Request, res: Response) => {
  const tree = await departmentsService.getTree();
  sendSuccess(res, tree);
});

export const getDepartment = asyncHandler(async (req: Request, res: Response) => {
  const dept = await departmentsService.findById(req.params.id);
  sendSuccess(res, dept);
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const body = createDeptSchema.parse(req.body);
  const dept = await departmentsService.create(body);
  sendCreated(res, dept);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const body = updateDeptSchema.parse(req.body);
  const dept = await departmentsService.update(req.params.id, body);
  sendSuccess(res, dept);
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  await departmentsService.softDelete(req.params.id);
  sendNoContent(res);
});
