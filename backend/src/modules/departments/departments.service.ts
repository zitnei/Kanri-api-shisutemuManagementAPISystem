import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

const DEPT_SELECT = {
  id: true,
  code: true,
  name: true,
  parentId: true,
  managerId: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  manager: {
    select: { id: true, name: true, email: true },
  },
  parent: {
    select: { id: true, name: true, code: true },
  },
  _count: {
    select: { users: true, children: true },
  },
} satisfies Prisma.DepartmentSelect;

export async function findAll(includeInactive = false) {
  const departments = await prisma.department.findMany({
    where: {
      deletedAt: null,
      ...(includeInactive ? {} : { isActive: true }),
    },
    select: DEPT_SELECT,
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
  });

  return departments;
}

export async function findById(id: string) {
  const dept = await prisma.department.findFirst({
    where: { id, deletedAt: null },
    select: DEPT_SELECT,
  });

  if (!dept) {
    throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
  }

  return dept;
}

export async function create(data: {
  code: string;
  name: string;
  parentId?: string;
  managerId?: string;
}) {
  return prisma.department.create({
    data: {
      code: data.code,
      name: data.name,
      parentId: data.parentId,
      managerId: data.managerId,
    },
    select: DEPT_SELECT,
  });
}

export async function update(
  id: string,
  data: {
    name?: string;
    parentId?: string | null;
    managerId?: string | null;
    isActive?: boolean;
  }
) {
  const existing = await prisma.department.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
  }

  // Prevent circular hierarchy
  if (data.parentId && data.parentId === id) {
    throw new AppError(400, 'CIRCULAR_REFERENCE', 'Department cannot be its own parent');
  }

  return prisma.department.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
      ...(data.managerId !== undefined ? { managerId: data.managerId } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    select: DEPT_SELECT,
  });
}

export async function softDelete(id: string) {
  const existing = await prisma.department.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
  }

  // Check if department has active users
  const userCount = await prisma.user.count({
    where: { departmentId: id, deletedAt: null },
  });

  if (userCount > 0) {
    throw new AppError(
      409,
      'DEPARTMENT_HAS_USERS',
      `Cannot delete department with ${userCount} active users`
    );
  }

  await prisma.department.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function getTree() {
  const depts = await prisma.department.findMany({
    where: { deletedAt: null, isActive: true },
    select: {
      ...DEPT_SELECT,
      children: {
        where: { deletedAt: null, isActive: true },
        select: DEPT_SELECT,
      },
    },
    orderBy: { name: 'asc' },
  });

  // Return only root departments (no parent)
  return depts.filter((d) => d.parentId === null);
}
