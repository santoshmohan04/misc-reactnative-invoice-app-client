export interface ApiEnvelope<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface ApiListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type EntityStatus = 'draft' | 'sent' | 'paid' | 'cancelled';
