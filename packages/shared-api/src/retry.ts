export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  shouldRetry?: (status?: number) => boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  executor: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const maxAttempts = options.maxAttempts ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 150;
  const shouldRetry = options.shouldRetry ?? ((status?: number) => !status || status >= 500);

  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await executor(attempt + 1);
    } catch (error) {
      attempt += 1;
      lastError = error;
      const status = Number((error as { status?: number })?.status || 0) || undefined;
      if (attempt >= maxAttempts || !shouldRetry(status)) {
        throw error;
      }
      await sleep(baseDelayMs * attempt);
    }
  }

  throw lastError;
};
