import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { buildOffsetQuery, buildOffsetResult } from '../../utils/pagination';

const APPROVAL_SELECT = {
  id: true,
  type: true,
  title: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  amount: true,
  fileUrl: true,
  comment: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  requester: {
    select: { id: true, name: true, email: true, employeeCode: true, department: { select: { name: true } } },
  },
  approver: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.ApprovalRequestSelect;

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalType = 'VACATION' | 'EXPENSE' | 'OVERTIME' | 'OTHER';

export async function findMany(params: {
  status?: ApprovalStatus;
  type?: ApprovalType;
  requesterId?: string;
  approverId?: string;
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
}) {
  const limit = Math.min(params.limit || 20, 100);
  const page = Math.max(params.page || 1, 1);

  const where: Prisma.ApprovalRequestWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.requesterId ? { requesterId: params.requesterId } : {}),
    ...(params.approverId ? { approverId: params.approverId } : {}),
  };

  // Non-admins/managers can only see their own requests
  if (params.userRole === 'employee' && params.userId) {
    where.requesterId = params.userId;
  }

  const [total, items] = await Promise.all([
    prisma.approvalRequest.count({ where }),
    prisma.approvalRequest.findMany({
      where,
      select: APPROVAL_SELECT,
      orderBy: { createdAt: 'desc' },
      ...buildOffsetQuery(page, limit),
    }),
  ]);

  return buildOffsetResult(items, total, page, limit);
}

export async function findById(id: string, userId: string, userRole: string) {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id },
    select: APPROVAL_SELECT,
  });

  if (!approval) {
    throw new AppError(404, 'APPROVAL_NOT_FOUND', 'Approval request not found');
  }

  // Employees can only see their own approvals
  if (userRole === 'employee' && approval.requester.id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view your own approval requests');
  }

  return approval;
}

export async function create(data: {
  requesterId: string;
  approverId?: string;
  type: string;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  amount?: number;
  fileUrl?: string;
}) {
  return prisma.approvalRequest.create({
    data: {
      requesterId: data.requesterId,
      approverId: data.approverId,
      type: data.type,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      amount: data.amount,
      fileUrl: data.fileUrl,
      status: 'PENDING',
    },
    select: APPROVAL_SELECT,
  });
}

export async function approve(id: string, approverId: string, comment?: string) {
  const approval = await prisma.approvalRequest.findUnique({ where: { id } });

  if (!approval) {
    throw new AppError(404, 'APPROVAL_NOT_FOUND', 'Approval request not found');
  }

  if (approval.status !== 'PENDING') {
    throw new AppError(400, 'ALREADY_REVIEWED', `Request has already been ${approval.status.toLowerCase()}`);
  }

  return prisma.approvalRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approverId,
      comment,
      reviewedAt: new Date(),
    },
    select: APPROVAL_SELECT,
  });
}

export async function reject(id: string, approverId: string, comment?: string) {
  const approval = await prisma.approvalRequest.findUnique({ where: { id } });

  if (!approval) {
    throw new AppError(404, 'APPROVAL_NOT_FOUND', 'Approval request not found');
  }

  if (approval.status !== 'PENDING') {
    throw new AppError(400, 'ALREADY_REVIEWED', `Request has already been ${approval.status.toLowerCase()}`);
  }

  return prisma.approvalRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approverId,
      comment,
      reviewedAt: new Date(),
    },
    select: APPROVAL_SELECT,
  });
}

export async function cancel(id: string, requesterId: string) {
  const approval = await prisma.approvalRequest.findUnique({ where: { id } });

  if (!approval) {
    throw new AppError(404, 'APPROVAL_NOT_FOUND', 'Approval request not found');
  }

  if (approval.requesterId !== requesterId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own requests');
  }

  if (approval.status !== 'PENDING') {
    throw new AppError(400, 'CANNOT_CANCEL', 'Only pending requests can be cancelled');
  }

  await prisma.approvalRequest.delete({ where: { id } });
}

export async function getStatusSummary() {
  const summary = await prisma.approvalRequest.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  return summary.reduce(
    (acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    },
    {} as Record<string, number>
  );
}
