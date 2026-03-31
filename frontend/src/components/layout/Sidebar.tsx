import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'ダッシュボード',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 13a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
      </svg>
    ),
  },
  {
    path: '/users',
    label: 'ユーザー管理',
    permission: 'users:read',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/departments',
    label: '部署管理',
    permission: 'departments:read',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    path: '/approvals',
    label: '承認管理',
    permission: 'approvals:read',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/audit-logs',
    label: '監査ログ',
    permission: 'audit-logs:read',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-[#1a1d27] border-r border-white/[0.06] flex flex-col z-20',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <span className="text-white text-xs font-black">K</span>
        </div>
        {!collapsed && (
          <div>
            <span className="text-base font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              KANRI
            </span>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              Management System
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span className={clsx('flex-shrink-0', isActive ? 'text-indigo-400' : '')}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.06] p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role.displayName}</p>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500',
            'hover:text-slate-300 hover:bg-white/[0.05] transition-colors text-sm',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? '展開' : '折りたたむ'}
        >
          <svg
            className={clsx('w-4 h-4 flex-shrink-0 transition-transform', collapsed ? 'rotate-180' : '')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span>折りたたむ</span>}
        </button>

        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500',
            'hover:text-red-400 hover:bg-red-500/[0.08] transition-colors text-sm mt-1',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'ログアウト' : undefined}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>ログアウト</span>}
        </button>
      </div>
    </aside>
  );
}
