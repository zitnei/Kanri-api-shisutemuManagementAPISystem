export interface PaginationParams {
  cursor?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
  hasMore: boolean;
}

export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
}

export function buildCursorQuery(options: CursorPaginationOptions): {
  skip?: number;
  cursor?: { id: string };
  take: number;
} {
  const { cursor, limit } = options;

  if (cursor) {
    return {
      cursor: { id: cursor },
      skip: 1,
      take: limit + 1,
    };
  }

  return {
    take: limit + 1,
  };
}

export function buildCursorResult<T extends { id: string }>(
  items: T[],
  limit: number,
  total: number
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const paginatedItems = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : null;

  return {
    items: paginatedItems,
    nextCursor,
    total,
    hasMore,
  };
}

export function buildOffsetQuery(page: number, limit: number): { skip: number; take: number } {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function buildOffsetResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): { items: T[]; total: number; page: number; limit: number; totalPages: number } {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function parsePaginationParams(query: Record<string, string | undefined>): {
  cursor?: string;
  limit: number;
  page: number;
} {
  const limit = Math.min(Number(query.limit) || 20, 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const cursor = query.cursor;

  return { cursor, limit, page };
}
