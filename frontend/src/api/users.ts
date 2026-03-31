import apiClient from './client';
import type { ApiResponse, User, DashboardStats } from '../types';

export interface ListUsersParams {
  search?: string;
  departmentId?: string;
  roleId?: string;
  isActive?: boolean;
  cursor?: string;
  limit?: number;
  page?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  nameKana?: string;
  employeeCode: string;
  phone?: string;
  departmentId?: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  nameKana?: string;
  phone?: string;
  avatarUrl?: string | null;
  departmentId?: string | null;
  roleId?: string;
  isActive?: boolean;
}

export async function listUsers(params: ListUsersParams = {}): Promise<{
  data: User[];
  total: number;
  cursor: string | null;
}> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.departmentId) query.set('departmentId', params.departmentId);
  if (params.roleId) query.set('roleId', params.roleId);
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.limit) query.set('limit', String(params.limit));

  const response = await apiClient.get<ApiResponse<User[]>>(`/users?${query.toString()}`);
  return {
    data: response.data.data || [],
    total: response.data.meta?.total || 0,
    cursor: response.data.meta?.cursor || null,
  };
}

export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data!;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>('/users', data);
  return response.data.data!;
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
  return response.data.data!;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function exportUsersCsv(params: ListUsersParams = {}): Promise<Blob> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.departmentId) query.set('departmentId', params.departmentId);
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive));

  const response = await apiClient.get(`/users/export/csv?${query.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/users/dashboard/stats');
  return response.data.data!;
}
