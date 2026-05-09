export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  kind: ApiErrorKind;
  statusCode?: number;
  message: string;
  retryable: boolean;
  details?: unknown;
}
