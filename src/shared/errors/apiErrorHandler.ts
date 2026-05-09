/**
 * Centralized API error handling utilities.
 * Provides consistent error display and logging across the app.
 */

import { extractErrorMessage, isAuthError, isValidationError, isNetworkError } from './errorTypes';
import { logger } from '../logger';
import { Sentry } from '../observability/sentry';
import { showAuthExpiredToast, showNetworkFailureToast, showToast, showValidationToast } from './toastSystem';

/**
 * Toast-style alert. In React Native, uses Alert.alert.
 * Can be replaced with toast library (react-native-toast-message) in future.
 */
export const showErrorToast = (message: string, title = 'Error') => {
  showToast(title, message, 'error');
};

export const showSuccessToast = (message: string, title = 'Success') => {
  showToast(title, message, 'success');
};

export const showWarningToast = (message: string, title = 'Warning') => {
  showToast(title, message, 'warning');
};

/**
 * Log API errors for debugging (in development or to analytics service).
 */
export const logApiError = (context: string, error: unknown, meta?: Record<string, any>) => {
  const message = extractErrorMessage(error);
  logger.error(message, `api:${context}`, {
    meta,
  });
  Sentry.captureException(error, {
    tags: {
      area: 'api',
      context,
    },
    extra: {
      meta,
      message,
    },
  });
};

/**
 * Handle API error and show appropriate user feedback.
 * Routes to specific error handlers based on error type.
 */
export const handleApiError = (error: unknown, context?: string): void => {
  const message = extractErrorMessage(error);

  if (context) {
    logApiError(context, error);
  }

  if (isAuthError(error)) {
    showAuthExpiredToast();
    return;
  }

  if (isValidationError(error)) {
    showValidationToast(message);
    return;
  }

  if (isNetworkError(error)) {
    showNetworkFailureToast();
    return;
  }

  // Generic error
  showErrorToast(message);
};

/**
 * Retry helper for failed requests.
 * Use in RTK Query's queryFn or in components for manual retry.
 */
export const createRetryableAsync = async <T,>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or auth errors
      if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.status && err.status >= 400 && err.status < 500) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

/**
 * Transform RTK Query error for consistent handling.
 */
export const transformApiError = (error: any) => {
  return {
    message: extractErrorMessage(error),
    isAuth: isAuthError(error),
    isValidation: isValidationError(error),
    isNetwork: isNetworkError(error),
    originalError: error,
  };
};
