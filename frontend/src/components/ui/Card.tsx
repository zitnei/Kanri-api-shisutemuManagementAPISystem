import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-[#1a1d27] border border-white/[0.08] rounded-xl',
        paddings[padding],
        hover && 'hover:-translate-y-0.5 hover:border-white/[0.12] transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  accentColor?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'red' | 'sky';
}

const accentMap = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};

export function StatCard({ title, value, subtitle, icon, trend, accentColor = 'indigo' }: StatCardProps) {
  const accent = accentMap[accentColor];

  return (
    <Card className="flex items-start gap-4" hover>
      <div className={clsx('p-3 rounded-xl border', accent.bg, accent.border)}>
        <span className={accent.text}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value.toLocaleString()}</p>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={clsx('text-xs mt-1', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </Card>
  );
}
