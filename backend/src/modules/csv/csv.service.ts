import { prisma } from '../../lib/prisma';

export async function exportUsers(filters: {
  search?: string;
  departmentId?: string;
  isActive?: boolean;
}): Promise<string> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      role: { select: { displayName: true } },
      department: { select: { name: true } },
    },
    orderBy: { employeeCode: 'asc' },
  });

  const headers = ['社員コード', '氏名', '氏名（カナ）', 'メール', '電話番号', '部署', '役割', 'ステータス', '登録日'];

  const rows = users.map((u) => [
    u.employeeCode,
    u.name,
    u.nameKana || '',
    u.email,
    u.phone || '',
    u.department?.name || '',
    u.role.displayName,
    u.isActive ? '有効' : '無効',
    u.createdAt.toISOString().split('T')[0],
  ]);

  return buildCsv(headers, rows);
}

export async function exportAuditLogs(filters: {
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<string> {
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10000, // Cap at 10k records
  });

  const headers = ['日時', 'ユーザー', 'メール', 'アクション', 'リソース', 'リソースID', 'IPアドレス'];

  const rows = logs.map((l) => [
    l.createdAt.toISOString(),
    l.user?.name || 'システム',
    l.user?.email || '',
    l.action,
    l.resource,
    l.resourceId || '',
    l.ipAddress || '',
  ]);

  return buildCsv(headers, rows);
}

function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const allRows = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return '\uFEFF' + allRows.join('\n');
}
