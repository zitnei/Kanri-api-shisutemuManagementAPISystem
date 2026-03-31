import apiClient from './client';
import type { ApiResponse, AuditLog } from '../types';

export interface ListAuditLogsParams {
  userId?: string;
  resource?: string;
  action?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function listAuditLogs(params: ListAuditLogsParams = {}): Promise<{
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams();
  if (params.userId) query.set('userId', params.userId);
  if (params.resource) query.set('resource', params.resource);
  if (params.action) query.set('action', params.action);
  if (params.search) query.set('search', params.search);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const response = await apiClient.get<ApiResponse<AuditLog[]>>(
    `/audit-logs?${query.toString()}`
  );
  return {
    data: response.data.data || [],
    total: response.data.meta?.total || 0,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 50,
  };
}

export async function getRecentActivity(limit = 10): Promise<AuditLog[]> {
  const response = await apiClient.get<ApiResponse<AuditLog[]>>(
    `/audit-logs/recent?limit=${limit}`
  );
  return response.data.data || [];
}

export async function getDistinctResources(): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>('/audit-logs/resources');
  return response.data.data || [];
}
