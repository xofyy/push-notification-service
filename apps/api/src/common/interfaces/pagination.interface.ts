export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

