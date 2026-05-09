import { Sentry } from './sentry';
import { logger } from '../logger';
import {
  showAuthExpiredToast,
  showNetworkFailureToast,
  showValidationToast,
  showToast,
} from '../errors/toastSystem';

type ErrorCategory = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

const getCategory = (error: unknown): ErrorCategory => {
  if (typeof error !== 'object' || error === null) {
    return 'unknown';
  }

  const maybeStatus = (error as { status?: number }).status;
  if (typeof maybeStatus === 'number') {
    if (maybeStatus === 401 || maybeStatus === 403) return 'auth';
    if (maybeStatus >= 400 && maybeStatus < 500) return 'validation';
    if (maybeStatus >= 500) return 'server';
  }

  const message = String((error as { message?: string }).message ?? '').toLowerCase();
  if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
    return 'network';
  }

  return 'unknown';
};

export const instrumentApiError = (operation: string, error: unknown, details?: Record<string, unknown>): void => {
  const category = getCategory(error);

  logger.error('API request failed', 'api_observability', {
    operation,
    category,
    details,
  });

  Sentry.captureException(error, {
    tags: {
      area: 'api',
      operation,
      category,
    },
    extra: details,
  });

  if (category === 'auth') {
    showAuthExpiredToast();
    return;
  }
  if (category === 'network') {
    showNetworkFailureToast();
    return;
  }
  if (category === 'validation') {
    showValidationToast('Please review your input and try again.');
    return;
  }

  showToast('Request failed', 'Something went wrong while processing your request.', 'error');
};

export const instrumentApiSuccess = (operation: string, details?: Record<string, unknown>): void => {
  logger.info('API request succeeded', 'api_observability', {
    operation,
    details,
  });
};
