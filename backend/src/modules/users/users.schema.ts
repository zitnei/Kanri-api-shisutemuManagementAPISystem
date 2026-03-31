import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100),
  nameKana: z.string().max(100).optional(),
  employeeCode: z.string().min(1, 'Employee code is required').max(20),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameKana: z.string().max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  cursor: z.string().optional(),
  limit: z.string().transform(Number).default('20'),
  page: z.string().transform(Number).default('1'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
