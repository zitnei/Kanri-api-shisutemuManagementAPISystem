import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { buildOffsetQuery, buildOffsetResult } from '../../utils/pagination';

export async function findMany(params: {
  userId?: string;
  resource?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const limit = Math.min(params.limit || 50, 200);
  const page = Math.max(params.page || 1, 1);

  const where: Prisma.AuditLogWhereInput = {
    ...(params.userId ? { userId: params.userId } : {}),
    ...(params.resource ? { resource: params.resource } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.dateFrom || params.dateTo
      ? {
          createdAt: {
            ...(params.dateFrom ? { gte: params.dateFrom } : {}),
            ...(params.dateTo ? { lte: params.dateTo } : {}),
          },
        }
      : {}),
    ...(params.search
      ? {
          OR: [
            { resource: { contains: params.search, mode: 'insensitive' } },
            { resourceId: { contains: params.search, mode: 'insensitive' } },
            { user: { name: { contains: params.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, employeeCode: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...buildOffsetQuery(page, limit),
    }),
  ]);

  return buildOffsetResult(items, total, page, limit);
}

export async function getDistinctResources(): Promise<string[]> {
  const results = await prisma.auditLog.findMany({
    select: { resource: true },
    distinct: ['resource'],
    orderBy: { resource: 'asc' },
  });
  return results.map((r) => r.resource);
}

export async function getRecentActivity(limit = 10) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
