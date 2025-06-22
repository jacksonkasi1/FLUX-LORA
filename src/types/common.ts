/**
 * Common utility types used across the application
 */

// ** Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

// ** Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type AsyncStatus = 'pending' | 'fulfilled' | 'rejected';

// ** Generic response wrapper
export interface ResponseWrapper<T> {
  data: T;
  message?: string;
  status: number;
}

// ** Form state types
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ** Loading state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ** Pagination types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ** Sort types
export type SortDirection = 'asc' | 'desc';
export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

// ** Filter types
export type FilterValue = string | number | boolean | null;
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}
