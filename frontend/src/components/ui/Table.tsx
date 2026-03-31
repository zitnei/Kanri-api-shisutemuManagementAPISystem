import { clsx } from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export function Table<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'データがありません',
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                  col.width,
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex items-center justify-center gap-3 text-slate-500">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <span>読み込み中...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'transition-colors duration-150',
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3 text-slate-300',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
