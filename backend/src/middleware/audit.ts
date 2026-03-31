import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function inferAction(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
}

function inferResource(path: string): string {
  // Extract resource name from path like /api/v1/users/123 -> users
  const parts = path.split('/').filter(Boolean);
  // Find the resource part after v1
  const v1Index = parts.indexOf('v1');
  if (v1Index !== -1 && parts.length > v1Index + 1) {
    return parts[v1Index + 1];
  }
  return parts[1] || 'unknown';
}

function inferResourceId(path: string): string | undefined {
  const parts = path.split('/').filter(Boolean);
  const v1Index = parts.indexOf('v1');
  if (v1Index !== -1 && parts.length > v1Index + 2) {
    const potentialId = parts[v1Index + 2];
    // Skip action words like 'approve', 'reject', 'export'
    const actionWords = ['approve', 'reject', 'export', 'refresh', 'logout'];
    if (!actionWords.includes(potentialId)) {
      return potentialId;
    }
  }
  return undefined;
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATION_METHODS.includes(req.method.toUpperCase())) {
    next();
    return;
  }

  const originalJson = res.json.bind(res);
  const requestBody = req.body ? { ...req.body } : undefined;

  // Remove sensitive fields from log
  if (requestBody) {
    delete requestBody.password;
    delete requestBody.passwordHash;
    delete requestBody.token;
  }

  res.json = function (body: unknown) {
    // Log after response is sent to avoid slowing down the request
    setImmediate(async () => {
      if (!req.user?.sub) return;

      try {
        const action = inferAction(req.method);
        const resource = inferResource(req.path);
        const resourceId = inferResourceId(req.path);

        // Extract response data for newValue
        let newValue: unknown = undefined;
        if (
          body &&
          typeof body === 'object' &&
          'data' in body &&
          body.data !== null
        ) {
          newValue = (body as { data: unknown }).data;
        }

        await prisma.auditLog.create({
          data: {
            userId: req.user!.sub,
            action,
            resource,
            resourceId,
            oldValue: undefined,
            newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
            ipAddress: req.ip || req.headers['x-forwarded-for']?.toString(),
            userAgent: req.headers['user-agent'],
          },
        });
      } catch (error) {
        logger.error('Failed to create audit log:', error);
      }
    });

    return originalJson(body);
  };

  next();
}

export default auditMiddleware;
