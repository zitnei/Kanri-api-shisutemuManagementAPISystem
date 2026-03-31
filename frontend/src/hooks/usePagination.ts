import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  cursor: string | null;
}

export interface PaginationControls {
  page: number;
  limit: number;
  cursor: string | null;
  total: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToNext: () => void;
  goToPrev: () => void;
  goToPage: (page: number) => void;
  setTotal: (total: number) => void;
  setCursor: (cursor: string | null) => void;
  reset: () => void;
}

export function usePagination(initialLimit = 20): PaginationControls {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [cursor, setCursorState] = useState<string | null>(null);
  const [total, setTotalState] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
    setCursorState(null);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
    setCursorState(null);
  }, [totalPages]);

  const setTotal = useCallback((newTotal: number) => {
    setTotalState(newTotal);
  }, []);

  const setCursor = useCallback((newCursor: string | null) => {
    setCursorState(newCursor);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setCursorState(null);
    setTotalState(0);
  }, []);

  return {
    page,
    limit,
    cursor,
    total,
    totalPages,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
    goToNext,
    goToPrev,
    goToPage,
    setTotal,
    setCursor,
    reset,
  };
}
