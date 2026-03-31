import { Request, Response } from 'express';
import * as usersService from './users.service';
import { createUserSchema, updateUserSchema, listUsersQuerySchema, changePasswordSchema } from './users.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = listUsersQuerySchema.parse(req.query);

  const result = await usersService.findMany({
    search: query.search,
    departmentId: query.departmentId,
    roleId: query.roleId,
    isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
    cursor: query.cursor,
    limit: query.limit,
  });

  sendSuccess(res, result.items, 200, {
    total: result.total,
    cursor: result.nextCursor,
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.findById(req.params.id);
  sendSuccess(res, user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const body = createUserSchema.parse(req.body);
  const user = await usersService.create(body);
  sendCreated(res, user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const body = updateUserSchema.parse(req.body);
  const user = await usersService.update(req.params.id, body);
  sendSuccess(res, user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await usersService.softDelete(req.params.id);
  sendNoContent(res);
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = changePasswordSchema.parse(req.body);
  await usersService.changePassword(req.user!.sub, body.currentPassword, body.newPassword);
  sendNoContent(res);
});

export const exportCsvHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = listUsersQuerySchema.parse(req.query);

  const csv = await usersService.exportCsv({
    search: query.search,
    departmentId: query.departmentId,
    roleId: query.roleId,
    isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="users_${Date.now()}.csv"`);
  res.send(csv);
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await usersService.getDashboardStats();
  sendSuccess(res, stats);
});
