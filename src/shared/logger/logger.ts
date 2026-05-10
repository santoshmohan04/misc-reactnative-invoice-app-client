import { redactSensitiveData } from './redaction';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogPayload {
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  tags?: Record<string, string>;
}

const isDev = __DEV__ ?? process.env.NODE_ENV !== 'production';

const shouldLog = (level: LogLevel): boolean => {
  if (isDev) {
    return true;
  }
  return level === 'warn' || level === 'error';
};

const emit = (level: LogLevel, payload: LogPayload): void => {
  if (!shouldLog(level)) {
    return;
  }

  const cleanMeta = payload.meta ? redactSensitiveData(payload.meta) : undefined;
  const prefix = payload.context ? `[${payload.context}]` : '';

  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${prefix} ${payload.message}`.trim();

  if (level === 'error') {
    console.error(line, cleanMeta ?? {});
    return;
  }

  if (level === 'warn') {
    console.warn(line, cleanMeta ?? {});
    return;
  }

  if (level === 'info') {
    console.info(line, cleanMeta ?? {});
    return;
  }

  console.log(line, cleanMeta ?? {});
};

export const logger = {
  debug: (message: string, context?: string, meta?: Record<string, unknown>) =>
    emit('debug', { message, context, meta }),
  info: (message: string, context?: string, meta?: Record<string, unknown>) =>
    emit('info', { message, context, meta }),
  warn: (message: string, context?: string, meta?: Record<string, unknown>) =>
    emit('warn', { message, context, meta }),
  error: (message: string, context?: string, meta?: Record<string, unknown>) =>
    emit('error', { message, context, meta }),
};
