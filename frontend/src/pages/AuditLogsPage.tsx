import { useEffect, useState, useRef } from 'react';
import { Input, Select } from '../components/ui/Input';
import { AuditActionBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import * as auditLogsApi from '../api/audit-logs';
import type { AuditLog } from '../types';

const ACTION_OPTIONS = [
  { value: '', label: 'すべてのアクション' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'READ', label: 'READ' },
];

export function AuditLogsPage() {
  const pagination = usePagination(50);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  async function loadLogs(page: number, searchVal = search) {
    setLoading(true);
    try {
      const result = await auditLogsApi.listAuditLogs({
        search: searchVal || undefined,
        resource: resourceFilter || undefined,
        action: actionFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: pagination.limit,
      });
      setLogs(result.data);
      pagination.setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  async function loadResources() {
    const r = await auditLogsApi.getDistinctResources();
    setResources(r);
  }

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    loadLogs(pagination.page);
  }, [pagination.page, resourceFilter, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      pagination.reset();
      loadLogs(1, search);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  const resourceOptions = [
    { value: '', label: 'すべてのリソース' },
    ...resources.map((r) => ({ value: r, label: r })),
  ];

  const actionColorMap: Record<string, string> = {
    CREATE: 'border-l-emerald-500',
    UPDATE: 'border-l-amber-500',
    DELETE: 'border-l-red-500',
    READ: 'border-l-slate-600',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">監査ログ</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {loading ? '読み込み中...' : `${pagination.total.toLocaleString()}件のログ`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="ユーザー・リソースで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="w-40">
            <Select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); pagination.reset(); }}
              options={resourceOptions}
            />
          </div>
          <div className="w-40">
            <Select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); pagination.reset(); }}
              options={ACTION_OPTIONS}
            />
          </div>
          <div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); pagination.reset(); }}
              label="開始日"
            />
          </div>
          <div>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); pagination.reset(); }}
              label="終了日"
            />
          </div>
        </div>
      </div>

      {/* Timeline logs */}
      <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-white/[0.04] animate-pulse">
                <div className="w-16 h-6 rounded-full bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.05] rounded w-1/2" />
                </div>
                <div className="w-24 h-3 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
            <p>ログがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-4 p-4 border-l-2 hover:bg-white/[0.02] transition-colors ${
                  actionColorMap[log.action] || 'border-l-slate-700'
                }`}
              >
                {/* Action badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <AuditActionBadge action={log.action} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-sm text-slate-300">
                      <span className="font-medium text-white">{log.user?.name || 'システム'}</span>
                      {' が '}
                      <code className="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-slate-400">
                        {log.resource}
                      </code>
                      {log.resourceId && (
                        <span className="text-slate-600">
                          {' / '}<code className="text-xs font-mono">{log.resourceId.slice(0, 12)}...</code>
                        </span>
                      )}
                      {' を '}
                      <span className="font-medium">
                        {log.action === 'CREATE' ? '作成' :
                         log.action === 'UPDATE' ? '更新' :
                         log.action === 'DELETE' ? '削除' : '参照'}
                      </span>
                      しました
                    </span>
                  </div>

                  {(log.newValue || log.oldValue) && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {log.oldValue && (
                        <details className="group">
                          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                            変更前を表示
                          </summary>
                          <pre className="mt-1 text-xs bg-white/[0.04] rounded p-2 text-slate-500 overflow-x-auto max-w-md">
                            {JSON.stringify(log.oldValue, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.newValue && (
                        <details className="group">
                          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                            変更後を表示
                          </summary>
                          <pre className="mt-1 text-xs bg-white/[0.04] rounded p-2 text-slate-400 overflow-x-auto max-w-md">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  {log.ipAddress && (
                    <p className="text-xs text-slate-600 mt-1">IP: {log.ipAddress}</p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-slate-600">
                    {new Date(log.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 border-t border-white/[0.06]">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onNext={pagination.goToNext}
            onPrev={pagination.goToPrev}
            onPage={pagination.goToPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
