# FRONTEND_CONTEXT

Last Updated: 2026-05-10
Workspace: misc-reactnative-invoice-app-client

## Assumptions And Scope
- This document covers both frontend apps in this repository:
  - Expo React Native app in the repository root (`App.tsx`, `src/`, `android/`, `ios/`).
  - Next.js web app in `web-app/`.
- This is a code-verified snapshot based on the current workspace state.

---

# 1. Project Overview

## App Purpose
InvoiceAppClient is a merchant-facing invoicing client. It supports:
- Merchant authentication
- Customer and item management
- Invoice creation/editing
- Invoice sending (email/payment flow)
- Profile management

## Current Development Status
Mobile (Expo RN):
- The mobile app is on modern patterns: TypeScript, Redux Toolkit, RTK Query, and react-hook-form + Zod.
- Screens and forms under `src/pages/` are TypeScript (`*.tsx`).
- Legacy `src/actions/` and `src/reducers/` folders are no longer present.

Web (Next.js):
- Next App Router app is active under `web-app/src/app`.
- Redux Toolkit + RTK Query are in use.
- Login flow sets auth cookie for middleware-based route protection.

## Platforms Supported
- Android (`android/`)
- iOS (`ios/`)
- Expo Web (`npm run web` at root)
- Next.js Web (`cd web-app && npm run dev`)

---

# 2. Tech Stack

## Mobile App (Root package)
Core:
- Expo `~51.0.0`
- React Native `0.74.5`
- React `18.2.0`
- TypeScript `~5.3.3`

State and data:
- `@reduxjs/toolkit`
- `react-redux`
- `redux-persist`
- RTK Query APIs in `src/store/apis/authApi.ts` and `src/store/apis/dataApi.ts`

Forms and validation:
- `react-hook-form`
- `zod`
- `@hookform/resolvers`

UI and platform:
- `tamagui`
- `@react-navigation/*`
- `react-native-reanimated`
- `react-native-gesture-handler`

Observability:
- `@sentry/react-native`
- Custom logger/performance modules under `src/shared/observability/` and `src/shared/logger/`

## Web App (`web-app/package.json`)
Core:
- Next.js `16.2.6`
- React `19.2.4`
- TypeScript `^5`

State and data:
- `@reduxjs/toolkit`
- `react-redux`
- RTK Query in `web-app/src/store/apiSlice.ts`

Forms/UI:
- `react-hook-form`
- `zod`
- Tailwind CSS 4
- `sonner`
- `lucide-react`

Observability:
- `@sentry/nextjs`

---

# 3. Folder Structure Analysis

## Top-Level Structure (Frontend-Relevant)
- `App.tsx`, `src/`: mobile frontend code
- `android/`, `ios/`: native projects
- `web/`: Expo web entry assets
- `web-app/`: separate Next.js frontend
- `packages/`: shared packages (`api-contracts`, `shared-api`, `shared-ui`, `shared-utils`)

## Mobile Source Structure (`src/`)
- `components/`: reusable UI/navigation components (TypeScript)
- `pages/`: route-level screens (TypeScript)
- `store/`: RTK store, typed hooks, slices, APIs
- `shared/`: forms, observability, errors, logging
- `features/`: feature-specific modules/utilities/components
- `utils/`, `types/`, `config/`

## Next App Structure (`web-app/src`)
- `app/`: App Router routes/layouts
- `store/`: Redux Toolkit + RTK Query
- `components/`, `lib/`, `types/`
- `middleware.ts`: auth route protection

## Important Clarification
- Root-level parallel Next artifacts (`middleware.ts`, `apiSlice.ts`, `DashboardLayout.tsx`) are not present at repository root.
- Current Next middleware/API slice live inside `web-app/src/`.

---

# 4. Routing & Navigation

## Mobile Navigation
- React Navigation with native stack + bottom tabs.
- Defined in `src/components/Routes.tsx`.
- Auth gate is route-tree based (`Routes` receives `isLoggedIn` from `src/Main.tsx`).

## Mobile Route Map
- Auth stack: `login`, `signup`
- App stack: `splash`, `home`, `customerForm`, `itemForm`, `invoiceForm`, `profile`
- Home tabs: `invoices`, `customers`, `items`

## Web Navigation
- Next App Router route groups under `web-app/src/app`.
- Middleware in `web-app/src/middleware.ts` protects dashboard routes based on `auth_token` cookie.

---

# 5. State Management Analysis

## Mobile State Architecture
- Redux Toolkit store in `src/store/index.ts`.
- Persisted auth via `redux-persist` (whitelist: `auth`) using AsyncStorage in current store config.
- UI slices include `customerUI`, `invoiceUI`, `itemUI`, and `user`.
- Server state handled by RTK Query (`authApi`, `dataApi`).

## Mobile Form Architecture
- Forms use `react-hook-form` + Zod.
- Shared fields are under `src/shared/forms/fields/` (`TextInputField.tsx`, `SelectField.tsx`).
- Redux-form is not in active use.

## Web State Architecture
- Redux Toolkit auth slice + RTK Query API slice.
- Login sets Redux credentials and also writes auth cookie (`setAuthCookie`) to align with middleware.

## Observed Risks
- `src/config/secureStorage.ts` exists but is not wired into the current store persist config.
- Some duplicated legacy utilities may still exist around the new architecture.

---

# 6. API Layer Analysis

## Mobile API Layer
- RTK Query endpoints in `src/store/apis/` are active.
- `authApi` includes token-refresh flow and concurrency control.
- `dataApi` serves invoices/customers/items queries and mutations.

## Web API Layer
- RTK Query API in `web-app/src/store/apiSlice.ts`.
- Uses shared contracts from `@contracts` and shared helpers from `@shared-api`.
- Handles token refresh and retries; emits observability events.

## Endpoint/Contract Direction
- The codebase is aligned toward shared API contracts via monorepo packages.
- Keep all new endpoint work centralized through the shared contract package to avoid divergence.

---

# 7. Authentication & Security

## Mobile
- Session gate derives from authenticated Redux state (`useIsAuthenticated` in `src/Main.tsx`).
- Sentry user context is set/cleared on auth state changes.

## Web
- Login stores token in Redux and cookie.
- Middleware redirects:
  - Protected routes -> `/login` if no token cookie
  - Auth routes -> `/dashboard` if token cookie exists

## Security Notes
- Base URL defaults still include non-TLS local URLs in development paths.
- Production deployment should enforce HTTPS-only API origins and secure cookie flags.

---

# 8. Web Compatibility Analysis

## Expo Web
- Supported via root `npm run web`.
- Mobile code has platform-aware compatibility abstractions.

## Next.js Web
- Buildable app structure present and root page (`web-app/src/app/page.tsx`) is syntactically valid.
- Middleware behavior is active (not permissive pass-through).

## Strategic Note
- Two web frontends still exist (Expo web and Next app). Product ownership boundaries should stay explicit to reduce drift.

---

# 9. Performance Notes

## Current Positive Changes
- Splash has retry/degraded startup behavior instead of hard app exit.
- RTK Query improves request lifecycle handling and reduces manual async boilerplate.
- Render/navigation performance logging exists in mobile app.

## Ongoing Opportunities
- Increase memoization/selective rendering in list-heavy screens.
- Consider further reduction of heavyweight dependencies if startup/bundle metrics require it.
- Add CI-level performance checks for both mobile and web-app.

---

# 10. UI/UX Notes

## Current State
- Mobile has consistent app-style layout with reusable headers/list components.
- Web app has functional auth/dashboard shell with Tailwind-based styling.

## Improvement Areas
- Strengthen empty/loading/error consistency across all web modules.
- Continue evolving shared design primitives/tokens across mobile and web-app where practical.

---

# 11. Build & Deployment Snapshot

## Root (Expo)
- Scripts include `start`, `android`, `ios`, `web`, `typecheck`.
- EAS config exists in `eas.json`.

## Web App
- Scripts include `dev`, `build`, `start`, `lint`.

## Release Hardening Reminder
- Validate Android/iOS signing and production environment configuration before release.

---

# 12. Logging, Monitoring, Observability

## Mobile
- Sentry integrated (`@sentry/react-native`).
- Error boundary and global toast host present.
- Custom logging/performance utilities are wired in app bootstrap.

## Web
- Sentry package present (`@sentry/nextjs`).
- API slice emits latency/error observability events.

---

# 13. Technical Debt (Current)

High-signal debt items:
- Dual web strategy (Expo web + Next app) increases maintenance overhead.
- Ensure unused/legacy files and dependencies are periodically cleaned.
- Confirm all auth persistence/storage paths are intentional and documented.

---

# 14. Recommended Next Steps

1. Keep documentation synchronized with code owners after major frontend changes.
2. Add CI gates for root and `web-app` (`typecheck`, `lint`, and build checks).
3. Decide explicit ownership boundaries for Expo web vs Next.js web.
4. Document production auth/session policy (cookies, refresh, token invalidation).

---

## Appendix A: High-Signal File References
- Mobile app bootstrap: `App.tsx`, `src/Main.tsx`
- Mobile navigation: `src/components/Routes.tsx`
- Mobile store: `src/store/index.ts`
- Mobile APIs: `src/store/apis/authApi.ts`, `src/store/apis/dataApi.ts`
- Splash behavior: `src/pages/Splash.tsx`
- Shared forms: `src/shared/forms/fields/`
- Mobile observability: `src/shared/observability/`, `src/shared/errors/`, `src/shared/logger/`

- Web root/layout: `web-app/src/app/layout.tsx`, `web-app/src/app/page.tsx`
- Web auth routes: `web-app/src/app/(auth)/login/page.tsx`, `web-app/src/app/(auth)/signup/page.tsx`
- Web middleware: `web-app/src/middleware.ts`
- Web store/API: `web-app/src/store/authSlice.ts`, `web-app/src/store/apiSlice.ts`

---

## Appendix B: Verification Notes
- `src/pages/authentication/` contains `Login.tsx` and `SignUp.tsx`.
- `src/pages/form-pages/` contains TypeScript forms (`CustomerForm.tsx`, `ItemForm.tsx`, `InvoiceForm.tsx`).
- `src/reducers/` is not present in the current repository layout.
- `web-app/src/app/page.tsx` is valid and performs auth-based redirect logic.
