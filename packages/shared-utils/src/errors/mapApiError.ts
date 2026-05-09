import type { AppError } from './types';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const mapApiError = (error: unknown): AppError => {
  if (typeof error === 'string') {
    const lower = error.toLowerCase();
    if (lower.includes('timeout')) {
      return {
        kind: 'timeout',
        message: 'Request timed out. Check your connection and try again.',
        retryable: true,
        details: error,
      };
    }

    return {
      kind: 'unknown',
      message: error || DEFAULT_ERROR_MESSAGE,
      retryable: false,
      details: error,
    };
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: number }).status || 0);
    if (status === 401) {
      return { kind: 'unauthorized', statusCode: status, message: 'Your session has expired. Please sign in again.', retryable: false, details: error };
    }
    if (status === 403) {
      return { kind: 'forbidden', statusCode: status, message: 'You do not have permission to perform this action.', retryable: false, details: error };
    }
    if (status === 404) {
      return { kind: 'not_found', statusCode: status, message: 'Requested resource was not found.', retryable: false, details: error };
    }
    if (status >= 500) {
      return { kind: 'server', statusCode: status, message: 'Server error. Please try again later.', retryable: true, details: error };
    }

    return {
      kind: 'validation',
      statusCode: status,
      message: ((error as { data?: { message?: string } }).data?.message) || DEFAULT_ERROR_MESSAGE,
      retryable: false,
      details: error,
    };
  }

  return {
    kind: 'unknown',
    message: DEFAULT_ERROR_MESSAGE,
    retryable: false,
    details: error,
  };
};
