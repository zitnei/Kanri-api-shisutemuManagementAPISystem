import apiClient from './client';
import type { ApiResponse, ApprovalRequest, ApprovalStatus, ApprovalType } from '../types';

export interface CreateApprovalData {
  approverId?: string;
  type: ApprovalType;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  fileUrl?: string;
}

export interface ListApprovalsParams {
  status?: ApprovalStatus;
  type?: ApprovalType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function listApprovals(params: ListApprovalsParams = {}): Promise<{
  data: ApprovalRequest[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.type) query.set('type', params.type);
  if (params.search) query.set('search', params.search);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const response = await apiClient.get<ApiResponse<ApprovalRequest[]>>(
    `/approvals?${query.toString()}`
  );
  return {
    data: response.data.data || [],
    total: response.data.meta?.total || 0,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 20,
  };
}

export async function getApproval(id: string): Promise<ApprovalRequest> {
  const response = await apiClient.get<ApiResponse<ApprovalRequest>>(`/approvals/${id}`);
  return response.data.data!;
}

export async function createApproval(data: CreateApprovalData): Promise<ApprovalRequest> {
  const response = await apiClient.post<ApiResponse<ApprovalRequest>>('/approvals', data);
  return response.data.data!;
}

export async function approveRequest(id: string, comment?: string): Promise<ApprovalRequest> {
  const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
    `/approvals/${id}/approve`,
    { comment }
  );
  return response.data.data!;
}

export async function rejectRequest(id: string, comment?: string): Promise<ApprovalRequest> {
  const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
    `/approvals/${id}/reject`,
    { comment }
  );
  return response.data.data!;
}

export async function cancelRequest(id: string): Promise<void> {
  await apiClient.delete(`/approvals/${id}`);
}

export async function bulkApprove(ids: string[], comment?: string): Promise<{ succeeded: number; failed: number; total: number }> {
  const response = await apiClient.post('/approvals/bulk-approve', { ids, comment });
  return response.data.data;
}

export async function getStatusSummary(): Promise<Record<string, number>> {
  const response = await apiClient.get<ApiResponse<Record<string, number>>>('/approvals/summary');
  return response.data.data || {};
}
