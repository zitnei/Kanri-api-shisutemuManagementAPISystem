import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1117] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500 hover:-translate-y-px',
      secondary:
        'bg-[#1a1d27] hover:bg-[#22263a] text-slate-200 border border-white/10 focus:ring-slate-500 hover:-translate-y-px',
      danger:
        'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 focus:ring-red-500 hover:-translate-y-px',
      ghost:
        'hover:bg-white/5 text-slate-300 hover:text-white focus:ring-slate-500',
      outline:
        'border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
