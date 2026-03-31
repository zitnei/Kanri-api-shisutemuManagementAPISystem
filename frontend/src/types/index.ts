export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    cursor?: string | null;
  };
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  managerId: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
  parent?: {
    id: string;
    name: string;
    code: string;
  } | null;
  _count?: {
    users: number;
    children: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  nameKana: string | null;
  employeeCode: string;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  deletedAt: string | null;
  departmentId: string | null;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalType = 'VACATION' | 'EXPENSE' | 'OVERTIME' | 'OTHER';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string | null;
  status: ApprovalStatus;
  startDate: string | null;
  endDate: string | null;
  amount: number | null;
  fileUrl: string | null;
  comment: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
    employeeCode: string;
    department: { name: string } | null;
  };
  approver: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    employeeCode?: string;
  } | null;
}

export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failReason: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  nameKana: string | null;
  employeeCode: string;
  avatarUrl: string | null;
  role: {
    name: string;
    displayName: string;
    permissions: string[];
  };
  department: {
    id: string;
    name: string;
  } | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  pendingApprovals: number;
  todayLogins: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  cursor?: string | null;
  hasMore?: boolean;
}
