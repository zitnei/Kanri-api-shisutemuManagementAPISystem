import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import * as departmentsApi from '../api/departments';
import type { Department } from '../types';
import { AxiosError } from 'axios';

export function DepartmentsPage() {
  const { hasPermission } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', parentId: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadDepartments() {
    setLoading(true);
    try {
      const depts = await departmentsApi.listDepartments(true);
      setDepartments(depts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function resetForm() {
    setFormData({ code: '', name: '', parentId: '' });
    setFormError('');
  }

  async function handleCreate() {
    if (!formData.code || !formData.name) {
      setFormError('コードと名称は必須です。');
      return;
    }
    setFormLoading(true);
    try {
      await departmentsApi.createDepartment({
        code: formData.code,
        name: formData.name,
        parentId: formData.parentId || undefined,
      });
      setIsCreateOpen(false);
      resetForm();
      await loadDepartments();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      setFormError(axiosErr.response?.data?.error?.message || '作成に失敗しました。');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingDept || !formData.name) {
      setFormError('名称は必須です。');
      return;
    }
    setFormLoading(true);
    try {
      await departmentsApi.updateDepartment(editingDept.id, {
        name: formData.name,
        parentId: formData.parentId || null,
      });
      setEditingDept(null);
      resetForm();
      await loadDepartments();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      setFormError(axiosErr.response?.data?.error?.message || '更新に失敗しました。');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingDept) return;
    setDeleteLoading(true);
    try {
      await departmentsApi.deleteDepartment(deletingDept.id);
      setDeletingDept(null);
      await loadDepartments();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      alert(axiosErr.response?.data?.error?.message || '削除に失敗しました。');
    } finally {
      setDeleteLoading(false);
    }
  }

  const parentOptions = [
    { value: '', label: '親部署なし（ルート）' },
    ...departments
      .filter((d) => !editingDept || d.id !== editingDept.id)
      .map((d) => ({ value: d.id, label: d.name })),
  ];

  const rootDepts = departments.filter((d) => !d.parentId);
  const childDepts = (parentId: string) => departments.filter((d) => d.parentId === parentId);

  const deptForm = (
    <div className="space-y-4">
      {formError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {formError}
        </div>
      )}
      {!editingDept && (
        <Input
          label="部署コード"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
          placeholder="例: ENG, SALES"
        />
      )}
      <Input
        label="部署名"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="例: エンジニアリング部"
      />
      <Select
        label="親部署"
        value={formData.parentId}
        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
        options={parentOptions}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">部署管理</h2>
          <p className="text-slate-500 text-sm mt-0.5">{departments.length}件の部署</p>
        </div>
        {hasPermission('departments:write') && (
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            + 新規部署
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-[#1a1d27] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      ) : rootDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
          </svg>
          <p>部署がありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rootDepts.map((root) => (
            <div key={root.id}>
              {/* Root department card */}
              <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{root.name}</h3>
                        <span className="font-mono text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded">{root.code}</span>
                      </div>
                      {root.manager && (
                        <p className="text-sm text-slate-500 mt-0.5">管理者: {root.manager.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={root.isActive ? 'success' : 'slate'} size="sm">
                          {root.isActive ? '有効' : '無効'}
                        </Badge>
                        {root._count && (
                          <span className="text-xs text-slate-500">{root._count.users}名</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {hasPermission('departments:write') && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingDept(root);
                          setFormData({ code: root.code, name: root.name, parentId: root.parentId || '' });
                        }}>
                          編集
                        </Button>
                      )}
                      {hasPermission('departments:delete') && (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeletingDept(root)}>
                          削除
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Child departments */}
              {childDepts(root.id).length > 0 && (
                <div className="ml-8 mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {childDepts(root.id).map((child) => (
                    <div key={child.id} className="bg-[#1a1d27] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-medium text-white">{child.name}</h4>
                            <span className="font-mono text-xs text-slate-600">{child.code}</span>
                            {child._count && (
                              <p className="text-xs text-slate-500 mt-1">{child._count.users}名</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {hasPermission('departments:write') && (
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingDept(child);
                                setFormData({ code: child.code, name: child.name, parentId: child.parentId || '' });
                              }}>
                                編集
                              </Button>
                            )}
                            {hasPermission('departments:delete') && (
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs" onClick={() => setDeletingDept(child)}>
                                削除
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm(); }}
        title="新規部署作成"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsCreateOpen(false); resetForm(); }}>キャンセル</Button>
            <Button variant="primary" onClick={handleCreate} loading={formLoading}>作成</Button>
          </>
        }
      >
        {deptForm}
      </Modal>

      <Modal
        isOpen={!!editingDept}
        onClose={() => { setEditingDept(null); resetForm(); }}
        title="部署の編集"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingDept(null)}>キャンセル</Button>
            <Button variant="primary" onClick={handleUpdate} loading={formLoading}>保存</Button>
          </>
        }
      >
        {deptForm}
      </Modal>

      <ConfirmModal
        isOpen={!!deletingDept}
        onClose={() => setDeletingDept(null)}
        onConfirm={handleDelete}
        title="部署の削除"
        message={`「${deletingDept?.name}」を削除しますか？ユーザーが所属していない場合のみ削除できます。`}
        confirmLabel="削除する"
        loading={deleteLoading}
      />
    </div>
  );
}
