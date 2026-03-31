import { clsx } from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'indigo' | 'violet';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const dotColorMap: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-400',
  violet: 'bg-violet-400',
};

export function Badge({ variant = 'slate', children, size = 'sm', dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColorMap[variant])} />
      )}
      {children}
    </span>
  );
}

export function ApprovalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: '承認待ち' },
    APPROVED: { variant: 'success', label: '承認済み' },
    REJECTED: { variant: 'danger', label: '却下' },
  };
  const config = map[status] || { variant: 'slate', label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function AuditActionBadge({ action }: { action: string }) {
  const map: Record<string, BadgeVariant> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    READ: 'slate',
  };
  return <Badge variant={map[action] || 'slate'}>{action}</Badge>;
}

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'success' : 'slate'} dot>
      {isActive ? '有効' : '無効'}
    </Badge>
  );
}
