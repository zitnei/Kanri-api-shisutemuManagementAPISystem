import { useEffect, useState } from 'react';
import { StatCard } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { AuditActionBadge } from '../components/ui/Badge';
import { getDashboardStats } from '../api/users';
import { getRecentActivity } from '../api/audit-logs';
import { getStatusSummary } from '../api/approvals';
import type { DashboardStats, AuditLog } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [approvalSummary, setApprovalSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [statsData, logsData, summaryData] = await Promise.allSettled([
        getDashboardStats(),
        getRecentActivity(10),
        getStatusSummary(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (logsData.status === 'fulfilled') setRecentLogs(logsData.value);
      if (summaryData.status === 'fulfilled') setApprovalSummary(summaryData.value);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const approvalTotal = Object.values(approvalSummary).reduce((a, b) => a + b, 0);

  function getApprovalPercent(key: string) {
    if (!approvalTotal) return 0;
    return Math.round(((approvalSummary[key] || 0) / approvalTotal) * 100);
  }

  const auditColumns = [
    {
      key: 'action',
      header: 'アクション',
      render: (log: AuditLog) => <AuditActionBadge action={log.action} />,
      width: 'w-28',
    },
    {
      key: 'resource',
      header: 'リソース',
      render: (log: AuditLog) => (
        <span className="text-slate-300 font-mono text-xs bg-white/[0.05] px-2 py-0.5 rounded">
          {log.resource}
          {log.resourceId ? `/${log.resourceId.slice(0, 8)}...` : ''}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'ユーザー',
      render: (log: AuditLog) => (
        <span className="text-slate-400 text-sm">{log.user?.name || 'システム'}</span>
      ),
    },
    {
      key: 'time',
      header: '日時',
      render: (log: AuditLog) => (
        <span className="text-slate-500 text-xs">
          {new Date(log.createdAt).toLocaleString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ダッシュボード</h2>
          <p className="text-slate-500 text-sm mt-1">
            {lastUpdated ? `最終更新: ${lastUpdated.toLocaleTimeString('ja-JP')}` : 'システムの概要と最近のアクティビティ'}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08] rounded-lg hover:border-white/[0.16] transition-all disabled:opacity-40"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          更新
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="総ユーザー数"
          value={loading ? '—' : (stats?.totalUsers || 0)}
          subtitle={loading ? '' : `有効: ${stats?.activeUsers || 0}名`}
          accentColor="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="有効部署数"
          value={loading ? '—' : (stats?.totalDepartments || 0)}
          accentColor="violet"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="承認待ち"
          value={loading ? '—' : (stats?.pendingApprovals || 0)}
          accentColor="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="本日のログイン"
          value={loading ? '—' : (stats?.todayLogins || 0)}
          accentColor="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          }
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="xl:col-span-2 bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">最近のアクティビティ</h3>
              <p className="text-xs text-slate-500 mt-0.5">直近10件の操作ログ</p>
            </div>
            <a href="/audit-logs" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              すべて表示 →
            </a>
          </div>
          <Table
            data={recentLogs}
            columns={auditColumns}
            loading={loading}
            emptyMessage="アクティビティがありません"
            keyExtractor={(log) => log.id}
          />
        </div>

        {/* Approval summary */}
        <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">承認申請の状況</h3>
            <p className="text-xs text-slate-500 mt-0.5">ステータス別の割合</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-white/[0.05] rounded mb-2" />
                  <div className="h-2 bg-white/[0.05] rounded" />
                </div>
              ))}
            </div>
          ) : approvalTotal === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
              申請データがありません
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { key: 'PENDING', label: '承認待ち', color: 'bg-amber-400' },
                { key: 'APPROVED', label: '承認済み', color: 'bg-emerald-400' },
                { key: 'REJECTED', label: '却下', color: 'bg-red-400' },
              ].map(({ key, label, color }) => {
                const count = approvalSummary[key] || 0;
                const pct = getApprovalPercent(key);
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{count}</span>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">合計申請数</span>
                  <span className="font-semibold text-white">{approvalTotal}件</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
