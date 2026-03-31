import { clsx } from 'clsx';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onNext: () => void;
  onPrev: () => void;
  onPage?: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onNext,
  onPrev,
  onPage,
  loading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const delta = 1;

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);

    if (left > 2) pages.push('...');

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push('...');

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-slate-500">
        {from}〜{to}件 / 全{total.toLocaleString()}件
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page <= 1 || loading}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            page <= 1 || loading
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          前へ
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-600">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage?.(p as number)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  page === p
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                    : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={onNext}
          disabled={page >= totalPages || loading}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            page >= totalPages || loading
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
          )}
        >
          次へ
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
