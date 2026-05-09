# Frontend Observability Setup

This project now includes enterprise-grade observability for both frontends:
- Expo React Native app
- Next.js web app

The setup is production-safe by default:
- secrets/tokens are redacted
- PII is disabled in Sentry transport
- sampling is environment-aware
- low-overhead defaults in production

## 1. Installed Packages

Mobile app (`package.json`):
- `@sentry/react-native`

Web app (`web-app/package.json`):
- `@sentry/nextjs`

## 2. Environment Variables

### Mobile (Expo)

Set in EAS secrets or CI env:
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_ENV` (development | staging | production)

Optional:
- `EXPO_PUBLIC_API_URL`

### Web (Next.js)

Set in `web-app/.env.local` for local testing and CI for releases:
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_APP_ENV` (development | staging | production)
- `NEXT_PUBLIC_APP_VERSION` (optional app version tag shown in diagnostics)
- `SENTRY_AUTH_TOKEN` (CI only)
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE` (recommended: git SHA)

Templates:
- `.env.observability.example`
- `web-app/.env.observability.example`

## 3. What Was Added

### Mobile

Sentry init + release/env:
- `src/shared/observability/sentry.ts`

Global crash boundary:
- `src/shared/errors/ErrorBoundary.tsx`

Global toast system:
- `src/shared/errors/toastSystem.ts`
- `src/shared/errors/GlobalToastHost.tsx`

Safe structured logger with redaction:
- `src/shared/logger/redaction.ts`
- `src/shared/logger/logger.ts`
- `src/shared/logger/index.ts`

Performance probes:
- `src/shared/observability/performance.ts`

Runtime wiring:
- `App.js` (Sentry init, boundary, profiler, startup metric, freeze monitor)
- `src/Main.tsx` (Sentry user context)
- `src/components/Routes.tsx` (navigation tracing + slow transition breadcrumb)
- `src/store/apis/authApi.ts` (auth/refresh instrumentation + latency)
- `src/store/apis/dataApi.ts` (API latency + mutation success/failure instrumentation)
- `src/shared/errors/apiErrorHandler.ts` (centralized toast + Sentry capture)

Expo plugin for source maps:
- `app.json` plugin includes `@sentry/react-native/expo`

### Web

Sentry config files:
- `web-app/sentry.client.config.ts`
- `web-app/sentry.server.config.ts`
- `web-app/sentry.edge.config.ts`
- `web-app/instrumentation.ts`

Next build plugin/source maps:
- `web-app/next.config.ts` uses `withSentryConfig`

Error capture and UX:
- `web-app/src/app/global-error.tsx`
- `web-app/src/app/(dashboard)/error.tsx` captures exceptions

User context and navigation diagnostics:
- `web-app/src/components/providers.tsx`

## 4. Release Workflow

### Mobile

1. Build app with env vars set.
2. Sentry Expo plugin uploads source maps during release pipeline.
3. Set release name consistently (`slug@version`) using app config.

### Web

1. Export `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE` in CI.
2. Run `next build` in `web-app`.
3. `withSentryConfig` uploads source maps and finalizes release.

Example release naming:
- `SENTRY_RELEASE=$GITHUB_SHA`

## 5. Debugging Workflow

### Local Development

- If DSN env vars are missing, Sentry stays disabled safely.
- Logs still appear in console through safe logger.
- Toast fallback uses native alerts for mobile and sonner for web.
- Web offline/online changes display user-friendly toasts.

### Production

- Use Sentry Issues for crash grouping.
- Inspect breadcrumbs for navigation transitions.
- Use tags: `area`, `operation`, `category` to filter API and UI failures.
- Slow transition warnings appear as captured messages.

## 6. Data Safety Guarantees

Never captured/logged intentionally:
- access tokens
- refresh tokens
- passwords
- payment/card fields

Protection mechanisms:
- `beforeSend` strips auth headers
- logger redacts sensitive keys recursively
- only non-sensitive user context fields are attached

## 7. Operational Notes

- Keep production sampling conservative:
  - traces: 0.1
  - profiles/replay: low percentages
- Raise sample rates temporarily during incident windows.
- Keep `SENTRY_AUTH_TOKEN` in CI secrets only, never in app runtime env.
