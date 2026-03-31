import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const routeLabels: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/users': 'ユーザー管理',
  '/departments': '部署管理',
  '/approvals': '承認管理',
  '/audit-logs': '監査ログ',
};

export function TopBar() {
  const location = useLocation();
  const { user } = useAuth();

  const label = routeLabels[location.pathname] || 'ページ';
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#1a1d27]/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold text-white">{label}</h1>
          <p className="text-xs text-slate-600">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell placeholder */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-200 leading-none">{user.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user.role.displayName}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
