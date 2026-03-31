import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function authorize(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }

    const userPermissions = req.user.permissions || [];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      sendError(
        res,
        403,
        'FORBIDDEN',
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
      return;
    }

    next();
  };
}

export function authorizeAny(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }

    const userPermissions = req.user.permissions || [];

    const hasAnyPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAnyPermission) {
      sendError(
        res,
        403,
        'FORBIDDEN',
        `Insufficient permissions. Required one of: ${requiredPermissions.join(', ')}`
      );
      return;
    }

    next();
  };
}

export default authorize;
