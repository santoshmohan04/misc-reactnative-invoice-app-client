import * as Sentry from '@sentry/nextjs';

const environment = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: environment === 'production' ? 0.05 : 0.2,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.Authorization;
    }
    return event;
  },
});
