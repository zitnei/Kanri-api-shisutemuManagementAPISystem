import apiClient from './client';
import type { ApiResponse, Department } from '../types';

export interface CreateDepartmentData {
  code: string;
  name: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export async function listDepartments(includeInactive = false): Promise<Department[]> {
  const response = await apiClient.get<ApiResponse<Department[]>>(
    `/departments?includeInactive=${includeInactive}`
  );
  return response.data.data || [];
}

export async function getDepartmentTree(): Promise<Department[]> {
  const response = await apiClient.get<ApiResponse<Department[]>>('/departments/tree');
  return response.data.data || [];
}

export async function getDepartment(id: string): Promise<Department> {
  const response = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
  return response.data.data!;
}

export async function createDepartment(data: CreateDepartmentData): Promise<Department> {
  const response = await apiClient.post<ApiResponse<Department>>('/departments', data);
  return response.data.data!;
}

export async function updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
  const response = await apiClient.patch<ApiResponse<Department>>(`/departments/${id}`, data);
  return response.data.data!;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}
