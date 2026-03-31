import { useEffect, useState, useCallback, useRef } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge, UserStatusBadge } from '../components/ui/Badge';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useAuth } from '../hooks/useAuth';
import * as usersApi from '../api/users';
import * as departmentsApi from '../api/departments';
import * as rolesApi from '../api/auth';
import type { User, Department } from '../types';
import { AxiosError } from 'axios';

interface UserFormData {
  email: string;
  password: string;
  name: string;
  nameKana: string;
  employeeCode: string;
  phone: string;
  departmentId: string;
  roleId: string;
}

const ROLE_OPTIONS = [
  { value: '', label: 'すべての役割' },
  { value: 'admin', label: '管理者' },
  { value: 'manager', label: 'マネージャー' },
  { value: 'employee', label: '一般社員' },
];

export function UsersPage() {
  const { hasPermission } = useAuth();
  const pagination = usePagination(20);

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '', password: '', name: '', nameKana: '', employeeCode: '',
    phone: '', departmentId: '', roleId: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; displayName: string }>>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  async function loadData(searchVal: string, page: number) {
    setLoading(true);
    try {
      const [usersResult, depts] = await Promise.all([
        usersApi.listUsers({
          search: searchVal || undefined,
          departmentId: deptFilter || undefined,
          isActive: statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined,
          page,
          limit: pagination.limit,
        }),
        departmentsApi.listDepartments(),
      ]);

      setUsers(usersResult.data);
      setDepartments(depts);
      pagination.setTotal(usersResult.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(search, pagination.page);
  }, [pagination.page, deptFilter, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      pagination.reset();
      loadData(search, 1);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  function resetForm() {
    setFormData({ email: '', password: '', name: '', nameKana: '', employeeCode: '', phone: '', departmentId: '', roleId: '' });
    setFormError('');
  }

  function openCreate() {
    resetForm();
    setIsCreateModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      nameKana: user.nameKana || '',
      employeeCode: user.employeeCode,
      phone: user.phone || '',
      departmentId: user.departmentId || '',
      roleId: user.roleId,
    });
    setFormError('');
  }

  async function handleCreate() {
    if (!formData.email || !formData.password || !formData.name || !formData.employeeCode || !formData.roleId) {
      setFormError('必須項目をすべて入力してください。');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      await usersApi.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nameKana: formData.nameKana || undefined,
        employeeCode: formData.employeeCode,
        phone: formData.phone || undefined,
        departmentId: formData.departmentId || undefined,
        roleId: formData.roleId,
      });
      setIsCreateModalOpen(false);
      await loadData(search, pagination.page);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      setFormError(axiosErr.response?.data?.error?.message || '作成に失敗しました。');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingUser) return;

    setFormLoading(true);
    setFormError('');
    try {
      await usersApi.updateUser(editingUser.id, {
        name: formData.name,
        nameKana: formData.nameKana || undefined,
        phone: formData.phone || undefined,
        departmentId: formData.departmentId || null,
        roleId: formData.roleId || undefined,
      });
      setEditingUser(null);
      await loadData(search, pagination.page);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      setFormError(axiosErr.response?.data?.error?.message || '更新に失敗しました。');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await usersApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      await loadData(search, pagination.page);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleExportCsv() {
    setExportLoading(true);
    try {
      const blob = await usersApi.exportUsersCsv({
        search: search || undefined,
        departmentId: deptFilter || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  const deptOptions = [
    { value: '', label: 'すべての部署' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const deptOptionsForForm = [
    { value: '', label: '部署なし' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const roleOptionsForForm = [
    { value: '', label: '役割を選択' },
    { value: 'admin-role', label: '管理者' },
    { value: 'manager-role', label: 'マネージャー' },
    { value: 'employee-role', label: '一般社員' },
  ];

  const columns = [
    {
      key: 'employeeCode',
      header: '社員コード',
      render: (user: User) => (
        <span className="font-mono text-xs text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded">
          {user.employeeCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: '氏名',
      render: (user: User) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{user.name}</p>
            {user.nameKana && <p className="text-xs text-slate-500">{user.nameKana}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'メール',
      render: (user: User) => <span className="text-slate-400 text-sm">{user.email}</span>,
    },
    {
      key: 'department',
      header: '部署',
      render: (user: User) => (
        <span className="text-slate-400 text-sm">{user.department?.name || '—'}</span>
      ),
    },
    {
      key: 'role',
      header: '役割',
      render: (user: User) => (
        <Badge variant="indigo">{user.role.displayName}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'ステータス',
      render: (user: User) => <UserStatusBadge isActive={user.isActive} />,
    },
    {
      key: 'actions',
      header: '操作',
      align: 'right' as const,
      render: (user: User) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission('users:write') && (
            <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
              編集
            </Button>
          )}
          {hasPermission('users:delete') && (
            <Button variant="ghost" size="sm" onClick={() => setDeletingUser(user)} className="text-red-400 hover:text-red-300">
              削除
            </Button>
          )}
        </div>
      ),
    },
  ];

  const userForm = (
    <div className="space-y-4">
      {formError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {formError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="氏名"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="氏名（カナ）"
          value={formData.nameKana}
          onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
        />
      </div>
      {!editingUser && (
        <Input
          label="メールアドレス"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      )}
      {!editingUser && (
        <Input
          label="パスワード"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          hint="8文字以上、大文字・数字を含む"
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="社員コード"
          value={formData.employeeCode}
          onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
          required
          disabled={!!editingUser}
        />
        <Input
          label="電話番号"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <Select
        label="部署"
        value={formData.departmentId}
        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
        options={deptOptionsForForm}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ユーザー管理</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? '読み込み中...' : `${pagination.total}名のユーザー`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('csv:export') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              loading={exportLoading}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              CSVエクスポート
            </Button>
          )}
          {hasPermission('users:write') && (
            <Button variant="primary" size="sm" onClick={openCreate}>
              + 新規追加
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="名前・メール・社員コードで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="w-44">
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={deptOptions}
              placeholder="すべての部署"
            />
          </div>
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: '全ステータス' },
                { value: 'true', label: '有効のみ' },
                { value: 'false', label: '無効のみ' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl overflow-hidden">
        <Table
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="ユーザーが見つかりません"
          keyExtractor={(u) => u.id}
        />
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
        title="新規ユーザー作成"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>キャンセル</Button>
            <Button variant="primary" onClick={handleCreate} loading={formLoading}>作成</Button>
          </>
        }
      >
        {userForm}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => { setEditingUser(null); resetForm(); }}
        title="ユーザー編集"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingUser(null)}>キャンセル</Button>
            <Button variant="primary" onClick={handleUpdate} loading={formLoading}>保存</Button>
          </>
        }
      >
        {userForm}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="ユーザーの削除"
        message={`「${deletingUser?.name}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除する"
        loading={deleteLoading}
      />
    </div>
  );
}
