import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema, refreshTokenSchema, logoutSchema } from './auth.schema';
import { sendSuccess, sendNoContent } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
  const userAgent = req.headers['user-agent'];

  const result = await authService.login(body.email, body.password, ipAddress, userAgent);
  sendSuccess(res, result);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = refreshTokenSchema.parse(req.body);
  const tokens = await authService.refreshTokens(body.refreshToken);
  sendSuccess(res, tokens);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = logoutSchema.parse(req.body);
  await authService.logout(req.user!.sub, body.refreshToken);
  sendNoContent(res);
});

export const logoutAllHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.sub);
  sendNoContent(res);
});

export const profileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.sub);
  sendSuccess(res, user);
});
