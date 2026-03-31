import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'rounded-full border-indigo-500/30 border-t-indigo-500 animate-spin',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-slate-500 text-sm">読み込み中...</p>
      </div>
    </div>
  );
}
