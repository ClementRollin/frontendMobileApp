export type ApiSuccessResponse<T> = {
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

export type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
};

export type PaginatedResponse<T> = ApiSuccessResponse<T[]> & {
  meta: PaginatedMeta;
};
