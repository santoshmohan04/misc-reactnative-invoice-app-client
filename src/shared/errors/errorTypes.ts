/**
 * Centralized API error types and utilities.
 * Used throughout RTK Query error handling.
 */

export interface ApiErrorPayload {
  message?: string;
  error?: string;
  status?: number;
  data?: unknown;
}

export class ApiError extends Error {
  status: number;
  message: string;
  originalError: unknown;

  constructor(status: number, message: string, originalError?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.message = message;
    this.originalError = originalError;
  }
}

/**
 * Extract readable error message from various error formats.
 * Handles RTK Query error responses, backend error payloads, and network errors.
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';

  // RTK Query error object
  if (typeof error === 'object' && 'data' in error) {
    const rtqError = error as any;
    if (rtqError.data?.message) return rtqError.data.message;
    if (rtqError.data?.error) return rtqError.data.error;
    if (typeof rtqError.data === 'string') return rtqError.data;
  }

  // Backend error payload
  if (typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }

  // Network error
  if (typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    const statusMessages: Record<number, string> = {
      400: 'Invalid request',
      401: 'Unauthorized - please log in again',
      403: 'Forbidden',
      404: 'Not found',
      409: 'Conflict',
      500: 'Server error',
      503: 'Service unavailable',
    };
    return statusMessages[status] || 'Network error';
  }

  // String error
  if (typeof error === 'string') return error;

  // Last resort
  return 'An unexpected error occurred';
};

/**
 * Check if error is authentication-related (401).
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return err.status === 401 || err.data?.status === 401;
  }
  return false;
};

/**
 * Check if error is a validation error (400).
 */
export const isValidationError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return err.status === 400 || err.data?.status === 400;
  }
  return false;
};

/**
 * Check if error is a network error (no status code).
 */
export const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return !err.status && err.originalError instanceof Error;
  }
  return false;
};
