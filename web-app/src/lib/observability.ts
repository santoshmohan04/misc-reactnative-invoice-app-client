import * as Sentry from '@sentry/nextjs';

type ErrorCategory = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

const sanitizeMeta = (meta?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!meta) {
    return undefined;
  }

  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (
      lower.includes('token') ||
      lower.includes('authorization') ||
      lower.includes('password') ||
      lower.includes('card') ||
      lower.includes('cvv')
    ) {
      safe[key] = '[REDACTED]';
      continue;
    }
    safe[key] = value;
  }

  return safe;
};

export const classifyError = (error: unknown): ErrorCategory => {
  if (typeof error !== 'object' || error === null) {
    return 'unknown';
  }

  const status = (error as { status?: number }).status;
  if (typeof status === 'number') {
    if (status === 401 || status === 403) return 'auth';
    if (status >= 400 && status < 500) return 'validation';
    if (status >= 500) return 'server';
  }

  const message = String((error as { message?: string }).message ?? '').toLowerCase();
  if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
    return 'network';
  }

  return 'unknown';
};

export const observeApiError = (
  operation: string,
  error: unknown,
  meta?: Record<string, unknown>,
): void => {
  const category = classifyError(error);

  Sentry.captureException(error, {
    tags: {
      area: 'api',
      operation,
      category,
    },
    extra: sanitizeMeta(meta),
  });
};

export const observeApiLatency = (
  operation: string,
  startedAt: number,
  ok: boolean,
): void => {
  const latencyMs = Math.round(performance.now() - startedAt);

  Sentry.addBreadcrumb({
    category: 'api_latency',
    level: ok ? 'info' : 'warning',
    message: `${operation} (${ok ? 'success' : 'failure'})`,
    data: { latencyMs },
  });

  if (latencyMs > 2000) {
    Sentry.captureMessage('Slow API request', {
      level: 'warning',
      tags: {
        area: 'performance',
        operation,
      },
      extra: {
        latencyMs,
      },
    });
  }
};
