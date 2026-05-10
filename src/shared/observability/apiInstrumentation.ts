import { Sentry } from './sentry';
import { logger } from '../logger';
import {
  showAuthExpiredToast,
  showNetworkFailureToast,
  showValidationToast,
  showToast,
} from '../errors/toastSystem';

type ErrorCategory = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

type NormalizedApiError = {
  status?: number;
  statusText?: string;
  message?: string;
  backendMessage?: string;
  errorCode?: string;
  originalType: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (!isRecord(error)) {
    return {
      message: typeof error === 'string' ? error : undefined,
      originalType: typeof error,
    };
  }

  const nestedError = isRecord(error.error) ? error.error : undefined;
  const data = isRecord(error.data)
    ? error.data
    : nestedError && isRecord(nestedError.data)
      ? nestedError.data
      : undefined;

  const statusCandidate =
    typeof error.status === 'number'
      ? error.status
      : nestedError && typeof nestedError.status === 'number'
        ? nestedError.status
        : undefined;

  const statusTextCandidate =
    typeof error.status === 'string'
      ? error.status
      : nestedError && typeof nestedError.status === 'string'
        ? nestedError.status
        : undefined;

  const messageCandidate =
    (typeof error.message === 'string' && error.message) ||
    (nestedError && typeof nestedError.message === 'string' ? nestedError.message : undefined) ||
    (typeof error.error === 'string' ? error.error : undefined) ||
    (nestedError && typeof nestedError.error === 'string' ? nestedError.error : undefined);

  const backendMessageCandidate =
    (data && typeof data.message === 'string' ? data.message : undefined) ||
    (data && typeof data.error === 'string' ? data.error : undefined);

  const errorCodeCandidate =
    (typeof error.code === 'string' ? error.code : undefined) ||
    (nestedError && typeof nestedError.code === 'string' ? nestedError.code : undefined) ||
    (data && typeof data.code === 'string' ? data.code : undefined);

  return {
    status: statusCandidate,
    statusText: statusTextCandidate,
    message: messageCandidate,
    backendMessage: backendMessageCandidate,
    errorCode: errorCodeCandidate,
    originalType:
      typeof error.name === 'string' && error.name.length > 0 ? error.name : 'object',
  };
};

const getCategory = (error: unknown): ErrorCategory => {
  const normalized = normalizeApiError(error);
  const maybeStatus = normalized.status;
  const statusText = normalized.statusText?.toUpperCase();

  if (typeof maybeStatus === 'number') {
    if (maybeStatus === 401 || maybeStatus === 403) return 'auth';
    if (maybeStatus >= 400 && maybeStatus < 500) return 'validation';
    if (maybeStatus >= 500) return 'server';
  }

  if (statusText === 'FETCH_ERROR' || statusText === 'TIMEOUT_ERROR') {
    return 'network';
  }

  if (statusText === 'PARSING_ERROR') {
    return 'server';
  }

  const message = String(normalized.backendMessage ?? normalized.message ?? '').toLowerCase();
  if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
    return 'network';
  }

  return 'unknown';
};

export const instrumentApiError = (operation: string, error: unknown, details?: Record<string, unknown>): void => {
  const normalized = normalizeApiError(error);
  const category = getCategory(error);
  const normalizedDetails = details ?? {
    status: normalized.status,
    statusText: normalized.statusText,
    message: normalized.message,
    backendMessage: normalized.backendMessage,
    errorCode: normalized.errorCode,
    originalType: normalized.originalType,
  };

  logger.error('API request failed', 'api_observability', {
    operation,
    category,
    details: normalizedDetails,
  });

  Sentry.captureException(error, {
    tags: {
      area: 'api',
      operation,
      category,
    },
    extra: normalizedDetails,
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
    showValidationToast(normalized.backendMessage ?? 'Please review your input and try again.');
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
