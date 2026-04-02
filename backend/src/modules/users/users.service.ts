import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { buildCursorQuery, buildCursorResult } from '../../utils/pagination';
import type { CreateUserInput, UpdateUserInput } from './users.schema';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  nameKana: true,
  employeeCode: true,
  avatarUrl: true,
  phone: true,
  isActive: true,
  deletedAt: true,
  departmentId: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: { id: true, name: true, displayName: true },
  },
  department: {
    select: { id: true, name: true, code: true },
  },
} satisfies Prisma.UserSelect;

export async function findMany(params: {
  search?: string;
  departmentId?: string;
  roleId?: string;
  roleName?: string;
  isActive?: boolean;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const limit = Math.min(params.limit || 20, 100);
  const sortOrder = params.sortOrder || 'desc';
  const sortBy = params.sortBy || 'createdAt';

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params.roleId ? { roleId: params.roleId } : {}),
    ...(params.roleName ? { role: { name: params.roleName } } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { employeeCode: { contains: params.search, mode: 'insensitive' } },
            { nameKana: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sortBy === 'name' ? { name: sortOrder } :
    sortBy === 'employeeCode' ? { employeeCode: sortOrder } :
    { createdAt: sortOrder };

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy,
      ...buildCursorQuery({ cursor: params.cursor, limit }),
    }),
  ]);

  return buildCursorResult(items, limit, total);
}

export async function forceLogout(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function getLoginHistory(userId: string, limit = 20) {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function findById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SELECT,
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return user;
}

export async function create(data: CreateUserInput) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      nameKana: data.nameKana,
      employeeCode: data.employeeCode,
      phone: data.phone,
      departmentId: data.departmentId,
      roleId: data.roleId,
    },
    select: USER_SELECT,
  });

  return user;
}

export async function update(id: string, data: UpdateUserInput) {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.nameKana !== undefined ? { nameKana: data.nameKana } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
      ...(data.roleId !== undefined ? { roleId: data.roleId } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    select: USER_SELECT,
  });

  return updated;
}

export async function softDelete(id: string) {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}

export async function exportCsv(params: {
  search?: string;
  departmentId?: string;
  roleId?: string;
  isActive?: boolean;
}): Promise<string> {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params.roleId ? { roleId: params.roleId } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { employeeCode: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    select: {
      ...USER_SELECT,
    },
    orderBy: { employeeCode: 'asc' },
  });

  const headers = [
    '社員コード', '氏名', '氏名（カナ）', 'メールアドレス',
    '電話番号', '部署', '役割', 'ステータス', '登録日',
  ];

  const rows = users.map((user) => [
    user.employeeCode,
    user.name,
    user.nameKana || '',
    user.email,
    user.phone || '',
    user.department?.name || '',
    user.role.displayName,
    user.isActive ? '有効' : '無効',
    user.createdAt.toISOString().split('T')[0],
  ]);

  const csvRows = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );

  return '\uFEFF' + csvRows.join('\n'); // BOM for Excel compatibility
}

export async function getDashboardStats() {
  const [totalUsers, activeUsers, totalDepartments, pendingApprovals, todayLogins] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.department.count({ where: { deletedAt: null, isActive: true } }),
      prisma.approvalRequest.count({ where: { status: 'PENDING' } }),
      prisma.loginHistory.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          success: true,
        },
      }),
    ]);

  return {
    totalUsers,
    activeUsers,
    totalDepartments,
    pendingApprovals,
    todayLogins,
  };
}
