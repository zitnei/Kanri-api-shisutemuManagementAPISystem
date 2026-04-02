import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ApprovalStatusBadge, Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useAuth } from '../hooks/useAuth';
import * as approvalsApi from '../api/approvals';
import type { ApprovalRequest, ApprovalStatus, ApprovalType } from '../types';
import { AxiosError } from 'axios';

const STATUS_TABS: Array<{ key: '' | ApprovalStatus; label: string }> = [
  { key: '', label: '全件' },
  { key: 'PENDING', label: '承認待ち' },
  { key: 'APPROVED', label: '承認済み' },
  { key: 'REJECTED', label: '却下' },
];

const TYPE_LABELS: Record<string, string> = {
  VACATION: '年次有給',
  EXPENSE: '経費精算',
  OVERTIME: '残業申請',
  OTHER: 'その他',
};

export function ApprovalsPage() {
  const { user, hasPermission } = useAuth();
  const pagination = usePagination(12);

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'' | ApprovalStatus>('');
  const [typeFilter, setTypeFilter] = useState<'' | ApprovalType>('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [reviewingApproval, setReviewingApproval] = useState<{
    approval: ApprovalRequest;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    type: 'VACATION' as const,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  async function loadApprovals(page: number, searchVal = search) {
    setLoading(true);
    try {
      const result = await approvalsApi.listApprovals({
        status: activeTab || undefined,
        type: typeFilter || undefined,
        search: searchVal || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: pagination.limit,
      });
      setApprovals(result.data);
      pagination.setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals(pagination.page);
  }, [pagination.page, activeTab, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      pagination.reset();
      loadApprovals(1, search);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  function handleTabChange(tab: '' | ApprovalStatus) {
    setActiveTab(tab);
    setSelectedIds(new Set());
    pagination.reset();
  }

  function resetFilters() {
    setSearch('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setSelectedIds(new Set());
    pagination.reset();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pendingIds = approvals.filter((a) => a.status === 'PENDING').map((a) => a.id);
    if (pendingIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingIds));
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await approvalsApi.bulkApprove(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadApprovals(pagination.page);
    } finally {
      setBulkLoading(false);
    }
  }

  const activeFilterCount = [search, typeFilter, dateFrom, dateTo].filter(Boolean).length;
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const allPendingSelected = pendingApprovals.length > 0 && pendingApprovals.every((a) => selectedIds.has(a.id));

  async function handleApprove() {
    if (!reviewingApproval) return;
    setReviewLoading(true);
    try {
      if (reviewingApproval.action === 'approve') {
        await approvalsApi.approveRequest(reviewingApproval.approval.id, reviewComment || undefined);
      } else {
        await approvalsApi.rejectRequest(reviewingApproval.approval.id, reviewComment || undefined);
      }
      setReviewingApproval(null);
      setReviewComment('');
      await loadApprovals(pagination.page);
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleCreate() {
    if (!createFormData.title) {
      setCreateError('タイトルは必須です。');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await approvalsApi.createApproval({
        type: createFormData.type,
        title: createFormData.title,
        description: createFormData.description || undefined,
        startDate: createFormData.startDate ? new Date(createFormData.startDate).toISOString() : undefined,
        endDate: createFormData.endDate ? new Date(createFormData.endDate).toISOString() : undefined,
        amount: createFormData.amount ? parseFloat(createFormData.amount) : undefined,
      });
      setIsCreateOpen(false);
      setCreateFormData({ type: 'VACATION', title: '', description: '', startDate: '', endDate: '', amount: '' });
      await loadApprovals(pagination.page);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      setCreateError(axiosErr.response?.data?.error?.message || '作成に失敗しました。');
    } finally {
      setCreateLoading(false);
    }
  }

  const canApprove = hasPermission('approvals:approve');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">承認管理</h2>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total}件の申請</p>
        </div>
        {hasPermission('approvals:write') && (
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            + 新規申請
          </Button>
        )}
      </div>

      {/* Status tabs + filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-[#1a1d27] border border-white/[0.08] rounded-xl p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {canApprove && selectedIds.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? '処理中...' : `選択した${selectedIds.size}件を一括承認`}
            </button>
          )}
        </div>

        {/* Search & filter bar */}
        <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="タイトル・申請者名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="w-36">
              <Select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as '' | ApprovalType); pagination.reset(); }}
                options={[
                  { value: '', label: 'すべての種別' },
                  { value: 'VACATION', label: '年次有給' },
                  { value: 'EXPENSE', label: '経費精算' },
                  { value: 'OVERTIME', label: '残業申請' },
                  { value: 'OTHER', label: 'その他' },
                ]}
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); pagination.reset(); }}
              label="開始日"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); pagination.reset(); }}
              label="終了日"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08] rounded px-3 py-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                リセット
                <span className="bg-white/10 text-[#f4f4f5] text-xs rounded-full px-1.5">{activeFilterCount}</span>
              </button>
            )}
            {canApprove && pendingApprovals.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08] rounded px-3 py-2 transition-colors"
              >
                <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${allPendingSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                  {allPendingSelected && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
                承認待ちを全選択
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Approvals grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-[#1a1d27] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>申請がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {canApprove && approval.status === 'PENDING' && (
                      <button
                        onClick={() => toggleSelect(approval.id)}
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selectedIds.has(approval.id) ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-white/50'}`}
                      >
                        {selectedIds.has(approval.id) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </button>
                    )}
                    <Badge variant="indigo" size="sm">{TYPE_LABELS[approval.type] || approval.type}</Badge>
                    <ApprovalStatusBadge status={approval.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{approval.title}</h3>
                </div>
              </div>

              {/* Description */}
              {approval.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{approval.description}</p>
              )}

              {/* Details */}
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{approval.requester.name}</span>
                  {approval.requester.department && (
                    <span className="text-slate-600">({approval.requester.department.name})</span>
                  )}
                </div>

                {(approval.startDate || approval.endDate) && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {approval.startDate && new Date(approval.startDate).toLocaleDateString('ja-JP')}
                      {approval.endDate && ` 〜 ${new Date(approval.endDate).toLocaleDateString('ja-JP')}`}
                    </span>
                  </div>
                )}

                {approval.amount && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>¥{approval.amount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(approval.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>

              {/* Comment */}
              {approval.comment && (
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-slate-400">{approval.comment}</p>
                </div>
              )}

              {/* Actions */}
              {canApprove && approval.status === 'PENDING' && (
                <div className="flex gap-2 mt-auto pt-2 border-t border-white/[0.06]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => setReviewingApproval({ approval, action: 'approve' })}
                  >
                    承認
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-400 hover:bg-red-500/10"
                    onClick={() => setReviewingApproval({ approval, action: 'reject' })}
                  >
                    却下
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="新規申請の作成"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>キャンセル</Button>
            <Button variant="primary" onClick={handleCreate} loading={createLoading}>申請する</Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {createError}
            </div>
          )}
          <Select
            label="申請種別"
            value={createFormData.type}
            onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value as typeof createFormData.type })}
            options={[
              { value: 'VACATION', label: '年次有給休暇' },
              { value: 'EXPENSE', label: '経費精算' },
              { value: 'OVERTIME', label: '残業申請' },
              { value: 'OTHER', label: 'その他' },
            ]}
          />
          <Input
            label="タイトル"
            value={createFormData.title}
            onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
            required
            placeholder="申請のタイトルを入力"
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">説明</label>
            <textarea
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#0f1117] border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-600 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="詳細を入力してください"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="開始日"
              type="date"
              value={createFormData.startDate}
              onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
            />
            <Input
              label="終了日"
              type="date"
              value={createFormData.endDate}
              onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
            />
          </div>
          {(createFormData.type === 'EXPENSE') && (
            <Input
              label="金額（円）"
              type="number"
              value={createFormData.amount}
              onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
              placeholder="0"
            />
          )}
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewingApproval}
        onClose={() => { setReviewingApproval(null); setReviewComment(''); }}
        title={reviewingApproval?.action === 'approve' ? '申請を承認' : '申請を却下'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewingApproval(null)}>キャンセル</Button>
            <Button
              variant={reviewingApproval?.action === 'approve' ? 'primary' : 'danger'}
              onClick={handleApprove}
              loading={reviewLoading}
            >
              {reviewingApproval?.action === 'approve' ? '承認する' : '却下する'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-sm font-medium text-white">{reviewingApproval?.approval.title}</p>
            <p className="text-xs text-slate-500 mt-1">{reviewingApproval?.approval.requester.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">コメント（任意）</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full bg-[#0f1117] border border-white/10 rounded-lg text-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="コメントを入力..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
