import { Platform } from 'react-native';
import { logger } from '../logger';

let freezeMonitorHandle: ReturnType<typeof setInterval> | null = null;

export const trackAppStartup = (startedAt: number, context = 'app_startup'): void => {
  const durationMs = Math.round(performance.now() - startedAt);
  logger.info('Application startup completed', context, {
    durationMs,
    platform: Platform.OS,
  });
};

export const startJsThreadFreezeMonitor = (thresholdMs = 600): void => {
  if (freezeMonitorHandle) {
    return;
  }

  let expected = Date.now() + thresholdMs;
  freezeMonitorHandle = setInterval(() => {
    const now = Date.now();
    const drift = now - expected;

    if (drift > thresholdMs) {
      logger.warn('JS thread freeze detected', 'performance', {
        driftMs: drift,
        thresholdMs,
      });
    }

    expected = now + thresholdMs;
  }, thresholdMs);
};

export const stopJsThreadFreezeMonitor = (): void => {
  if (freezeMonitorHandle) {
    clearInterval(freezeMonitorHandle);
    freezeMonitorHandle = null;
  }
};

export const withLatencyMetric = async <T>(
  operationName: string,
  fn: () => T | PromiseLike<T>,
): Promise<T> => {
  const startedAt = performance.now();
  try {
    const result = await fn();
    logger.info('API latency measured', 'performance', {
      operationName,
      latencyMs: Math.round(performance.now() - startedAt),
      outcome: 'success',
    });
    return result;
  } catch (error) {
    logger.warn('API latency measured with failure', 'performance', {
      operationName,
      latencyMs: Math.round(performance.now() - startedAt),
      outcome: 'failure',
    });
    throw error;
  }
};
