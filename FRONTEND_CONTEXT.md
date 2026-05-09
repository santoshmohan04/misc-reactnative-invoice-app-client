# FRONTEND_CONTEXT

Last Updated: 2026-05-09  
Workspace: misc-reactnative-invoice-app-client

## Assumptions And Scope
- This document analyzes both frontend implementations present in the repository:
  - Mobile-first Expo React Native app under `src` and root config.
  - Separate Next.js web application under `web-app`.
- Analysis is based on the current repository state, plus recent migration work performed in Phase 2 (RTK/RTK Query/react-hook-form).
- This file has been updated to reflect code changes made in the workspace: RTK infrastructure, API fixes, and several migrated screens/forms.

---

# 1. Project Overview

## App Purpose
InvoiceAppClient is a merchant-facing invoicing client for small businesses. It supports:
- Merchant registration/login
- Customer and item management
- Invoice creation/editing
- Invoice email sending with payment-session creation
- Profile management (company/address/currency)

Evidence:
- README.md
- src/actions/invoice.actions.js
- src/pages/form-pages/InvoiceForm.js

## Core Modules / Features
Mobile (Expo RN):
- Auth: Login, SignUp, logout, persisted auth token
- Master data: customers, items
- Billing: invoices with line items and totals
- Email flow: send invoice via backend endpoint
- Splash preload: invoices + customers + items before home

Web (Next app in web-app):
- Auth pages and dashboard shell
- RTK Query API layer for invoices/customers/items/auth
- Dashboard cards and static/mock chart visualizations
- Placeholder reports/settings pages

## Current Development Status
- Mobile app: modernization is COMPLETE. All screens and forms now use the modern RTK + RTK Query + react-hook-form stack. Redux-form has been completely removed. The codebase is 100% on new patterns.

  Key Phase 2 foundation items completed:
  - TypeScript enabled with `strict` settings and path aliases (see `tsconfig.json`).
  - RTK store with `redux-persist` for auth state and typed hooks (`useAppDispatch`, `useAppSelector`, `useAuth*`).
  - `authApi` and `dataApi` implemented with RTK Query. `authApi` includes automatic token refresh with a mutex to avoid concurrent refreshes.
  - `react-hook-form` + Zod used for migrated forms; example `Login.tsx` and `SignUp.tsx` created in TypeScript.
  - Several files rewritten to match backend contracts and shared package exports (notably `src/store/apis/authApi.ts`, `src/store/apis/dataApi.ts`).

  Migration progress (delta):
  - ✅ List screens migrated: `Invoices`, `Customers`, `Items` (now function components using RTK Query hooks).
  - ✅ Forms migrated: `CustomerForm`, `ItemForm`, `InvoiceForm`, `Profile` → all converted to `react-hook-form` + TypeScript implementations with Zod validation.
  - ✅ Redux-form completely removed from the codebase.
  - ✅ New form architecture created: `src/shared/forms/` with reusable TextInputField, SelectField, and hooks.
  - ✅ All validation migrated from redux-form validators to Zod schemas.

  **Phase 2 is complete. The mobile app is fully modernized with zero legacy redux-form code.**

## Platforms Supported
- Android: configured via android/
- iOS: configured via ios/
- Web:
  - Expo Web through expo start --web
  - Separate Next.js app in web-app

## Authentication Flow Overview
Mobile:
1. User submits login/register in src/pages/authentication/*.js
2. auth.actions.js calls fetchApi on /user/login or /user/register
3. On success, dispatch AUTH_USER_SUCCESS with token + refreshToken
4. getUser() called to fetch /user/user
5. Main.js computes hasSession from authData.isLoggedIn && authData.token
6. Routes chooses AuthStack vs AppStack

Web-app:
1. login/signup pages call RTK Query mutations
2. setCredentials stores token in Redux state only
3. No persisted auth in cookies/localStorage by default in web-app slice
4. middleware currently allows all requests (no guard enforcement)

## Navigation Overview
Mobile:
- React Navigation Native Stack + Bottom Tabs
- AuthStack: login, signup
- AppStack: splash -> home tabs -> forms/profile
- Home tabs: invoices/customers/items using custom tab bar

Web-app:
- Next App Router structure
- Route groups: (auth), (dashboard)
- Dashboard shell contains side nav links to dashboard modules

---

# 2. Tech Stack

## Mobile App (Root package)
Installed versions from npm ls --depth=0:
- React Native: 0.74.5
- Expo: 51.0.39 (manifest uses ~51.0.0)
- React: 18.2.0
- TypeScript: 5.3.3

Navigation libraries:
- @react-navigation/native 6.1.18
- @react-navigation/native-stack 6.11.0
- @react-navigation/bottom-tabs 6.6.1

State management libraries:
- redux 5.0.1
- react-redux 9.2.0
- redux-thunk 3.1.0 (legacy, being phased out)
- redux-persist 6.0.0

API libraries:
- fetch (native/global) actively used via src/service/api.js
- axios 1.16.0 installed but not used by mobile API layer

UI libraries:
- tamagui 2.0.0-rc.42
- @tamagui/core 2.0.0-rc.42
- @tamagui/config 2.0.0-rc.42
- @expo/vector-icons 14.1.0

Validation libraries:
  - Zod 3.x with @hookform/resolvers for runtime validation.
  - react-hook-form 7.x for form state management and validation.

Storage libraries:
- expo-secure-store 13.0.2
- @react-native-async-storage/async-storage 1.23.1

Animation libraries:
- react-native-reanimated 3.10.1
- react-native-gesture-handler 2.16.2

Chart/report libraries:
- None in mobile app currently

Build tools:
- Expo CLI/Metro
- Android Gradle Plugin 8.2.1
- Gradle 8.8 wrapper
- CocoaPods via ios/Podfile

Testing tools:
- react-test-renderer via __tests__/App-test.js (minimal snapshot-style render)

Linting/formatting tools:
- ESLint via .eslintrc.js extending @react-native-community
- Prettier via .prettierrc.js

## Web App (web-app/package.json)
Installed versions from npm ls --depth=0:
- Next.js 16.2.6
- React 19.2.4
- React DOM 19.2.4
- TypeScript 5.9.3

Navigation/routing:
- Next App Router (filesystem routing)

State management:
- @reduxjs/toolkit 2.11.2
- react-redux 9.2.0
- RTK Query via createApi

API:
- RTK Query fetchBaseQuery
- axios 1.16.0 installed (not primary path)

UI:
- Tailwind CSS 4.3.0
- lucide-react 0.441.0 icons
- next-themes 0.4.6
- sonner 1.7.4
- clsx + tailwind-merge for class composition

Forms/validation:
- react-hook-form 7.75.0
- zod 3.25.76
- @hookform/resolvers 3.10.0

Charts/reports:
- recharts 2.15.4

Linting:
- eslint 9.39.4
- eslint-config-next 16.2.6

## Why Major Packages Are Used
- React Navigation family: mobile stack + tabs + native transitions.
- Redux + Thunk: legacy async side effects and global state across auth/domain slices.
- redux-persist: keep session/state across app restarts.
- expo-secure-store: token storage on native devices with fallback behavior.
- redux-form: centralized form field state/validation in Redux (legacy pattern).
- Tamagui: incremental UI modernization from older UI stack.
- RTK Query (web-app): declarative data fetching/caching for Next client pages.
- react-hook-form + zod (web-app): modern form handling and schema validation.
- Recharts (web-app): dashboard visualization scaffolding.

---

# 3. Folder Structure Analysis

## Top-Level Structure
- src: primary Expo RN application source
- android / ios: native platform projects
- web: Expo web static entry point
- web-app: separate Next.js frontend
- root config: app.json, babel.config.js, metro.config.js, eas.json, tsconfig.json
- root Next-like artifacts: middleware.ts, apiSlice.ts, DashboardLayout.tsx

## src Structure Purpose
- src/actions: thunk async actions per domain
- src/reducers: slice reducers by domain + root combine
- src/pages: route-level screens
  - authentication: login/signup
  - main: tab pages
  - form-pages: CRUD forms
- src/components: shared UI pieces and renderers
- src/components/reduxFormRenderers: form-field adapters
- src/config: store and secure storage glue
- src/service: API transport abstraction
- src/utils: validators, error handling, navigation helper, currency helpers

## web-app Structure Purpose
- src/app: App Router pages/layouts
- src/store: Redux Toolkit + RTK Query
- src/components: providers + primitives
- src/lib: utility functions
- src/types: shared TS types (light currently)
- src/middleware.ts: Next middleware (currently permissive)

## Current Architecture Pattern
Mobile: modern (Phase 2 complete)
- RTK + RTK Query for server state and mutations
- react-hook-form + Zod for all form state and validation
- TypeScript with strict mode throughout
- Local form state (no global form Redux)
- Pure, reusable calculation utilities
- Memoized field components (`TextInputField`, `SelectField`) to prevent unnecessary re-renders
- API layer: RTK Query baseQuery handles auth headers and token refresh automatically via mutex

Web-app: modern Next.js app
- Next app uses RTK Query for data fetching and a modern React stack (client components + Tailwind/Tamagui split depending on target).

## Separation Of Concerns
Strengths:
- Mobile has clear directories by concern.
- API transport is centralized via RTK Query baseQuery.
- Form components are memoized and isolated.
- Validation logic is centralized in Zod schemas.

Weaknesses:
- Significant business logic in UI components (especially list refresh logic).
- Mixed concerns in pages (UI + API outcome orchestration + alerts).
- Two web strategies co-exist (can be cleaned up in future).

## Reusability Approach
- Reusable headers and list item components exist.
- Reusable form renderers for text/select/date/array fields.
- Currency and validation utility extraction present.
- Limited typed contracts and no design-tokenized component system for mobile.

## Architectural Issues Observed
- Dual web frontends (Expo web + Next app) without explicit ownership boundaries.
- Root contains orphan/parallel Next artifacts (middleware.ts, apiSlice.ts, DashboardLayout.tsx).
- Legacy stack in mobile slows modernization (class components + redux-form).
- Web-app middleware security not enforced despite auth UI flow.

---

# 4. Routing & Navigation

## Mobile Navigation Type
- React Navigation with:
  - Native Stack (root)
  - Bottom Tab (home)
- Implemented in src/components/Routes.js

Hierarchy:
- NavigationContainer
  - AuthStack (login, signup) when not authenticated
  - AppStack (splash, home tabs, forms, profile) when authenticated

## Protected Routes / Auth Guards
- Mobile guard is state-based at root render level only:
  - Main.js computes hasSession from Redux auth reducer
- No per-screen fine-grained guard once inside AppStack.

## Deep Linking Support
- No explicit linking configuration found in NavigationContainer.
- Deep link support appears not configured.

## Web Navigation Handling
- Expo Web path follows React Navigation behavior in RN app.
- Next web-app uses file-system routing.
- web-app middleware currently returns NextResponse.next() for all routes, so server-side auth guard is effectively disabled.

## Problems / Improvements Needed
- Add explicit linking config for React Navigation if deep linking is required.
- Add token validation + expiry check before entering protected stack.
- Implement actual Next middleware auth checks for web-app.
- Decide single strategic web navigation architecture to reduce divergence.

---

# 5. State Management Analysis

## Current Global State Approach
Mobile:
- Redux store with domain reducers:
  - authReducer
  - userReducer
  - customerReducer
  - itemReducer
  - invoiceReducer
  - form (redux-form)
- Thunk for async actions
- Persist with split strategy:
  - root persisted in AsyncStorage
  - authReducer persisted via custom secureStorage wrapper

Web-app:
- Redux Toolkit store
- auth slice with user/token/isAuthenticated
- RTK Query API slice for requests/cache

## Local State Usage
- Mobile uses class component local state sparingly; mostly Redux-driven state.
- Web-app uses React useState for sidebar and local form states via react-hook-form.

## API Caching Approach
- Mobile: no true caching layer; each list refreshed by explicit dispatch calls.
- Web-app: RTK Query provides request lifecycle and caching.

## Persistence Strategy
Mobile:
- redux-persist root + auth-specific secure storage
- secureStorage.ts routes web storage to AsyncStorage and native to SecureStore with fallback

Web-app:
- No durable auth persistence in store by default
- middleware expects cookie but login writes only Redux state

## Async Handling
Mobile:
- thunk actions with manual success/error branching and action dispatch sequences
- API timeout via Promise.race 5s in src/service/api.js

Web-app:
- RTK Query mutation/query hooks with unwrap in forms

## Context Usage
- No app-level React Context for business state in mobile.
- ThemeProvider in web-app via next-themes.

## Data Flow Patterns
Mobile canonical flow:
UI -> dispatch thunk -> fetchApi -> reducer -> connected component reads updated slice

Form flow:
redux-form field state in Redux -> submit handler dispatches thunk -> optional list refetch -> Alert

## Current Problems
- Over-centralized Redux for form state causes unnecessary global updates.
- Manual thunk boilerplate repeated across domains.
- Error and loading semantics duplicated in each reducer.
- Inconsistent state contracts (many reducers initialize with empty object).
- Refresh chains tightly coupled to views.

## Performance Risks
- Frequent full list refetch after each create/update operation.
- connect + class component pattern without memoized selectors can trigger broad re-renders.
- redux-form stores field changes globally, expensive for complex forms.

## Scalability Risks
- Action/reducer sprawl as features grow.
- No normalized entity cache strategy.
- Limited typing in mobile JS code increases regression risk.

## Recommended Future Architecture
Mobile recommendation:
- Migrate from redux-form + thunks to Redux Toolkit + RTK Query + react-hook-form.
- Keep SecureStore for native secrets; decouple non-sensitive caches.
- Use typed slices/selectors and normalized entities where appropriate.

## Migration Recommendation
- Yes, migration is recommended.
- Suggested sequence:
  1. Introduce RTK store wrapper while preserving existing reducers.
  2. Move API reads to RTK Query incrementally by domain.
  3. Replace redux-form screen-by-screen with react-hook-form.
  4. Convert class screens to function components with hooks.

---

# 6. API Layer Analysis

## Mobile API Service Structure
- src/service/api.js contains:
  - BASE_URL resolution logic (expo config + env + platform-aware web hostname rewrite)
  - raw api(url, method, body, headers)
  - fetchApi wrapper with status code checks and parsed response envelope
  - token extraction from multiple header/body shapes

## Axios / Fetch Setup
- Mobile uses fetch only.
- axios is installed but unused in mobile path.
- web-app uses RTK Query fetchBaseQuery.

## Environment Handling
Mobile:
- app.json extra.baseUrl and extra.webBaseUrl
- EXPO_PUBLIC_API_BASE_URL override support
- web hostname replacement to avoid localhost/LAN mismatch

Web-app:
- NEXT_PUBLIC_API_URL fallback to http://localhost:3333

## Token Management
Mobile:
- Tokens are now centrally managed in an RTK `auth` slice and persisted with `redux-persist` (auth-only). The RTK Query `baseQuery` attaches `Authorization: Bearer <token>` automatically for authenticated calls.
- Token extraction/utility helpers live in `packages/shared-api` (e.g. `extractAccessToken`) and are used by `authApi` and helper code.

Web-app:
- Web stores tokens in the RTK auth slice as well; persistence behavior is environment-specific (localStorage/cookies) but the preferred pattern is using RTK state and refresh flows via `authApi`.

## Refresh Token Handling
- RTK Query `authApi` implements an automatic refresh workflow: on 401 `baseQueryWithReauth` requests the refresh endpoint, updates tokens via `authSlice` on success, and retries the original request. A `RefreshMutex` is used to ensure only one refresh is in-flight and to queue other requests until refresh completes. If refresh fails, the user is logged out.

## Error Handling
- RTK Query endpoints use `transformResponse` to unwrap success envelopes; legacy `fetchApi` returned a structured result. Error mapping utilities exist in `src/utils/error.utils.js` and are used in UI components to show messages and alerts.

## Retry Strategy
- No global retry/backoff policy is enabled by default; RTK Query supports retry options if needed and could be configured for flaky networks.

## Request Interceptors / Response Interceptors
- Legacy mobile API had no interceptor system; RTK Query's `baseQuery` now centralizes header injection and can handle refresh/retry logic.

## API Typing Quality
- New RTK Query APIs and TypeScript types are being introduced; migrated endpoints use typed Zod schemas and TypeScript interfaces. Legacy mobile API remains untyped JS and should be migrated progressively.

## All API Base URLs Detected
- Configured base URLs appear in `app.json`, `src/service/api.js` and web-app RTK slices; environment helpers in `src/config/env.ts` and `web-app` centralize runtime selection.

## Major Endpoints Detected (canonical)
Canonical endpoints aligned with `packages/api-contracts`:
- `/user/login`, `/user/register`, `/user/user`, `/user/edit`, `/user/logout`, `/user/refresh`
- `/invoice/all`, `/invoice/edit`, `/invoice/send`
- `/customer/all`, `/customer/edit`
- `/item/all`, `/item/edit`
- `/payment/create`

Note: earlier inconsistencies existed between mobile and web naming (singular vs plural, `/user` vs `/auth`). RTK Query files were aligned to the canonical `packages/api-contracts` endpoints during Phase 2 updates.

## Missing Abstractions
- Domain-level service wrappers above the transport layer are still sparse in mobile; consider adding small domain service modules that call RTK Query or shared contracts to centralize payload normalization and error handling.

## Security Concerns
- Some configs include HTTP base URLs; ensure production avoids non-TLS endpoints.
- Remove or silence token logging in legacy thunks (`auth.actions.js`).
- The auth refresh flow now exists, but verify refresh token storage/rotation strategy for production security needs.

---

# 7. Authentication & Security

## Login Implementation
Mobile:
- Login form -> loginUser thunk -> fetchApi('/user/login') -> AUTH_USER_SUCCESS
- Separate getUser call retrieves profile

Web-app:
- login page uses useLoginMutation and dispatches setCredentials

## Session Management
Mobile:
- Session determined by Redux authData with persisted token
- Route gating at Main.js level

Web-app:
- session in volatile Redux state
- server middleware not aligned with client auth storage

## Secure Storage Usage
- secureStorage.ts uses SecureStore on native and AsyncStorage on web
- key sanitization handles redux-persist colon key incompatibility

## Token Handling
- Mobile supports multiple token source formats from headers/body.
- Outgoing auth currently only Authorization bearer in mobile fetchApi.

## Route Protection
- Mobile: coarse stack-level gate
- web-app: middleware currently permissive; practical protection weak

## Web Security Concerns
- auth state can be lost on refresh if not persisted (depending on setup)
- no HttpOnly cookie session strategy implemented
- root apiSlice.ts references localStorage directly in prepareHeaders (unsafe on server contexts and duplicated architecture)

## Mobile Security Concerns
- token logging in console
- no root-level inactivity timeout/session expiration logic
- no certificate pinning/network hardening

## Secrets Handling
- app.json contains LAN base URL, not secret but environment-coupled
- no dedicated .env strategy documented for multi-environment deployment

## Environment Variable Handling
- EXPO_PUBLIC_API_BASE_URL supported for mobile
- NEXT_PUBLIC_API_URL supported in web-app
- no explicit per-environment config matrix or validation

## Security Improvements
- Remove token/response console logs in auth and invoice flows.
- Implement refresh token flow and 401 recovery strategy.
- Adopt secure cookie strategy for web-app auth (HttpOnly + SameSite + Secure).
- Add environment validation at app startup.
- Enforce HTTPS in production URLs.
- Add session timeout and forced re-auth policy.

## Missing Best Practices
- No centralized auth token lifecycle manager.
- No CSP/headers strategy documented for Next app.
- No secure telemetry redaction policy for PII payloads.

---

# 8. Web Compatibility Analysis

## Current Expo Web Compatibility
- Expo web entry works and app has platform-aware API URL resolver.
- secureStorage fallback to AsyncStorage on web avoids SecureStore runtime issues.
- metro.config.js excludes web-app folder to reduce watcher overhead.

## Components Causing Web Issues
- Global use of Alert and mobile-first UI may be acceptable but not web-optimized UX.
- Some RN interactions and layouts are not desktop-first.

## Native-Only Packages
- expo-secure-store and datetime picker have platform-specific behavior; mitigations exist.
- react-native-reanimated/gesture-handler configured via Expo stack.

## Hydration / Render Issues
web-app:
- web-app/src/app/page.tsx contains trailing scaffold code after export function block, likely causing compile failure.
- layout uses suppressHydrationWarning and theme switching; acceptable with current setup.

## Performance Bottlenecks
- Expo web bundling entire RN stack may be heavier than dedicated web architecture.
- Next web-app uses many client components; limited server component/data fetching strategy.

## Blank Screen Risks
- Mobile Splash page exits app if any preload request fails (BackHandler.exitApp), poor recoverability.
- web-app root page syntax corruption can block startup.

## Metro Bundler Issues
- Explicit blockList for web-app helps Metro performance and avoids crawling unrelated Next sources.

## Babel Issues
- babel.config.js is minimal and correct for Expo + reanimated plugin.

## Web Optimization Opportunities
- For Expo Web:
  - Add code splitting boundaries where possible.
  - Move heavy data operations off initial route.
- For web-app:
  - Convert suitable pages/components to server components.
  - Implement route-level loading.tsx and error.tsx.

## Recommended Migration Strategy
- Decide one web strategy:
  1. If rapid cross-platform parity needed: keep Expo web as primary web UI.
  2. If SEO/SSR and enterprise web UX needed: elevate Next web-app and share domain/API package with mobile.

## Is Expo Web Enough?
- Enough for internal tools/MVP parity and basic browser support.
- Not ideal for SEO-heavy or highly web-optimized product marketing/admin portals.

## Is Next.js + React Native Web Recommended?
- Recommended only with explicit consolidation plan.
- Current repository has two parallel web stacks; unify ownership before adding more complexity.

## SSR Feasibility
- Expo web: SSR not native focus.
- Next web-app: SSR feasible but current implementation is mostly client components and would need refactoring.

## SEO Feasibility
- Expo web: limited SEO suitability for app-like flows.
- Next web-app: good SEO potential if pages are server-rendered with metadata and crawlable content.

---

# 9. Performance Analysis

## Re-render Risks
Mobile:
- Connected class components consume broad reducer slices.
- redux-form global updates on each input change.
- Non-memoized list item rendering in FlatList callbacks.

Web-app:
- Dashboard layout and pages are client components; some render paths not optimized.

## Heavy Components
- InvoiceForm.js is a large component with form logic, calculations, dispatch, and email flow orchestration.
- RenderItemsInputArray dynamic fields can trigger frequent recalculations.

## Bundle Size Risks
- Two web frontends in one repo increase install/build complexity.
- Mobile includes tamagui + redux-form + moment; moment can be heavy for limited formatting use.

## Lazy Loading Usage
- None detected in mobile route setup.
- No explicit dynamic imports in web-app pages.

## Memoization Usage
- Minimal to none in mobile class components.
- Limited memoization in web-app.

## FlatList Optimization
- keyExtractor present using _id or index.
- Missing getItemLayout/initialNumToRender/windowSize tuning.
- No memoized row component for large lists.

## Image Optimization
- No advanced image optimization strategy observed.

## API Overfetching
- Full lists refetched after edits in each domain action flow.
- Splash preloads all major lists always.

## Web Performance
- web-app uses static mock chart data but still fetches datasets for cards.
- Root page corruption currently a hard blocker for performance testing.

## Startup Performance
- Splash waits on three API calls before entering home.
- On slow network, startup latency can become significant.

## Immediate Optimizations
- Remove console logs in production paths.
- Add memoized row components and useCallback equivalents where converted to function components.
- Replace moment with lighter date formatting utilities.
- Add retry/partial load behavior on splash.

## Medium-Term Optimizations
- Migrate data fetching to RTK Query in mobile for caching/invalidation.
- Introduce optimistic updates for CRUD operations.
- Split heavy screen modules and lazy load forms.

## Enterprise-Scale Optimizations
- Introduce offline-first cache policy and background sync queues.
- Build performance budgets for web and mobile bundles.
- Add telemetry-driven render profiling and endpoint latency monitoring.

---

# 10. UI/UX Analysis

## Design Consistency
- Mobile uses consistent blue/neutral palette and card patterns.
- Some components still mix Tamagui and React Native primitives inconsistently.
- web-app follows Tailwind utility style but appears scaffold-like and generic.

## Responsive Behavior
Mobile:
- Basic responsive behavior through flex layouts and scroll containers.

Web-app:
- Dashboard layout has mobile sidebar handling.
- Auth pages centered and responsive by width constraints.

## Theme Support
- Mobile uses light-centric styles.
- web-app supports dark mode with next-themes.

## Accessibility
- Limited explicit accessibility props in mobile components.
- Buttons and inputs mostly semantic but no comprehensive a11y strategy.
- web-app has basic semantic structure; lacks robust keyboard/focus audits.

## Typography
- Mobile uses default system fonts and basic weights.
- web-app uses Geist variables in layout, but globals.css body sets Arial fallback, creating inconsistency.

## Layout Quality
- Mobile layout is functional, form-heavy, and predictable.
- web-app dashboards are present but still mostly placeholder-level business depth.

## Loading States
- Mobile: loader overlays for some operations.
- Splash shows brand while loading all data.
- web-app: simple Loading... strings in pages.

## Empty States
- Mobile has EmptyListPlaceHolder across core lists.
- web-app has limited empty-state handling.

## Error States
- Mobile uses Alert via ErrorUtils.
- web-app mostly toasts for auth failures; limited domain error handling.

## Form UX
- Mobile forms are comprehensive but verbose; validation messages present.
- web-app auth forms are cleaner and schema-driven.

## Navigation UX
- Mobile tab + header UX is straightforward.
- web-app dashboard nav is modern but search header area is unfinished.

## Modern UI Improvements
- Introduce shared design tokens and component variants for mobile and web-app.
- Build consistent typography scale and spacing system.
- Add skeleton loaders and contextual error banners.

## UX Improvements
- Replace all-or-nothing splash with partial data readiness model.
- Add retry CTA instead of forced exit on preload failure.
- Add inline field-specific backend validation errors.

## Missing Enterprise UX Patterns
- Empty state CTAs with guided onboarding.
- Global command palette / quick actions.
- Bulk operations and advanced filtering/search across entities.
- Draft autosave and unsaved-changes guards in forms.

---

# 11. Component Architecture

## Shared Components
Mobile shared:
- MainPageHeader, InnerPageHeader
- NavBar
- ListView
- Loader
- EmptyListPlaceHolder
- redux-form field renderers

Web-app shared:
- ui/card.tsx
- providers.tsx
- lib/utils.ts cn helper

## Reusable UI System
- Mobile has reusable components but no strict design-system package.
- Tamagui is present but not fully leveraged as a cohesive system.

## Design System Presence
- Partial only. Styles are mostly per-component StyleSheet literals.

## Props Quality
- Mobile uses loosely typed props (JS, not TS) and many implicit assumptions (e.g., userDetails.base_currency existence).
- Some prop naming inconsistencies and typo risk (valdiate in ItemForm price Field).

## Component Composition
- Large page components compose many responsibilities (state orchestration + rendering + side effects).

## Coupling Issues
- Pages tightly coupled to Redux store shape and action creators.
- Form renderers coupled to redux-form API contracts.

## Large Component Risks
- InvoiceForm is high-complexity and high-regression-risk.

## Improvements
- Split page containers vs presentational components.
- Adopt typed props/interfaces and domain-specific hooks.
- Introduce feature-level UI modules (invoice/components, customer/components).

## Atomic Design Feasibility
- Feasible and beneficial, especially for web-app where utility-first CSS already aligns with reusable primitives.

## UI Kit Recommendations
- Mobile: commit fully to Tamagui tokens/components or RN + custom system, avoid half-mixed style.
- Web-app: continue Tailwind + primitive components (card/button/input/table) with consolidated variants.

---

# 12. Dependency Analysis

## Important Dependencies
Mobile:
- expo, react-native, react-navigation stack, redux stack, redux-persist, secure-store, tamagui

Web-app:
- next, react, @reduxjs/toolkit, react-hook-form, zod, recharts, tailwindcss

## Deprecated / Aging Risk Dependencies
- redux-form 8.3.10 is legacy and no longer preferred in modern React ecosystem.
- moment 2.30.1 is mature but heavy; often replaced by dayjs/date-fns/luxon.

## Risky Dependencies / Patterns
- Multiple overlapping architecture packages across two web strategies.
- Release Android signing uses debug keystore in android/app/build.gradle.

## Large Dependencies
- moment
- tamagui + related packages
- recharts (web-app)

## Potentially Unused / Underused Dependencies
- Mobile axios appears unused in src/service/api.js flow.
- root apiSlice.ts and middleware.ts suggest partial/unintegrated Next layer.
- web-app includes jsonwebtoken but no clear usage in scanned files.

## Native Modules
- expo-secure-store
- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- datetimepicker

## Web-Incompatible Modules
- Native-only modules are guarded or isolated for mobile paths.
- secureStorage handles web fallback correctly.

## Better Alternatives
- Replace redux-form with react-hook-form.
- Replace thunk-heavy boilerplate with RTK Query + createAsyncThunk where needed.
- Replace moment with lighter date utility.

## Packages To Remove (After Validation)
- axios from mobile package if no callsites remain.
- root duplicated Next artifacts if web-app is canonical Next frontend.

## Packages To Add
- Mobile testing: @testing-library/react-native, jest mocks for navigation/api.
- Monitoring: Sentry SDK (Expo + Next integration as needed).
- Validation contracts: shared schema package (zod or typed interfaces).

---

# 13. Build & Deployment

## Expo Configuration
- app.json defines app identifiers, splash assets, base URLs, secure-store plugin.
- eas.json has development/preview/production profiles; production submit has placeholder appleId.

## Build Configuration
Android:
- compileSdk 34, targetSdk 34, minSdk 23
- Hermes enabled
- Release build currently signs with debug keystore (not production ready)

iOS:
- Podfile includes React Native setup with Flipper config
- Podfile appears to contain duplicated legacy sections after target block; this can create maintenance/build fragility.

Web Build Setup
- Expo web via expo start --web
- Separate Next app build scripts inside web-app

## Environment Configs
- Mobile: app.json extra + EXPO_PUBLIC_API_BASE_URL
- Web-app: NEXT_PUBLIC_API_URL
- No centralized env validation/checklist for CI and production

## CI/CD Readiness
- No explicit CI workflow detected for lint/test/build gates in analyzed files.
- Build scripts are present but release hardening is incomplete.

## Production Readiness Improvements
- Configure real Android release signing keys.
- Clean and validate ios/Podfile duplicated sections.
- Add environment-specific app config and secret handling.
- Add production API URL strategy and HTTPS enforcement.

## Deployment Improvements
- Define deployment matrix: Expo OTA/EAS vs app-store binaries.
- For web-app, define hosting target (Vercel/Azure/etc) and secure middleware auth.

## Build Optimization Improvements
- Add prebuild checks for env vars and API endpoints.
- Add typecheck/lint/test steps in CI for both root and web-app.

---

# 14. Logging & Error Handling

## Current Logging Strategy
- Mostly ad hoc console.log in action flows.
- User-facing errors via Alert (mobile) and toast (web-app auth).

## Error Boundaries
- No React ErrorBoundary implementation found in mobile or web-app root.

## API Error Handling
- Mobile fetchApi returns structured success/result and throws on unexpected status.
- ErrorUtils maps message fallback chain to Alert.
- web-app relies on RTK Query hook error handling but pages mostly minimal.

## Crash Handling
- No crash reporting integration detected.

## Monitoring Setup
- No Sentry/Datadog/NewRelic instrumentation found.

## Analytics Setup
- No product analytics provider integrated.

## Better Logging Architecture
- Introduce centralized logger abstraction with levels and redaction.
- Disable sensitive logs in production.
- Emit correlation IDs for API calls.

## Monitoring Tools Recommendation
- Sentry for JS/native crash + performance traces.
- Optional backend-correlated tracing (OpenTelemetry-compatible pipeline).

## Crash Reporting Tools
- Expo + Sentry integration for mobile.
- Sentry Next.js SDK for web-app.

---

# 15. Reports, Analytics & Dashboard Opportunities

## Reports To Add
- Invoice aging report (0-30, 31-60, 61+ days)
- Revenue by month/quarter/year
- Customer balance and top customers
- Item sales velocity and margin report
- Tax summary and export-ready statements

## Analytics Features
- Cohort of repeat customers
- Invoice conversion funnel (draft -> sent -> paid)
- Average payment delay trend
- Churn/retention for active customers

## Dashboard Improvements
- Replace static chart data in web-app analytics/dashboard with real API aggregates.
- Add date range selectors and comparison periods.

## Charts
- Revenue line chart
- Outstanding receivables bar chart
- Payment status donut chart
- Top products horizontal bar chart

## Export Features
- CSV, XLSX, and PDF export for invoices and reports
- Scheduled email reports

## Admin Features
- Multi-user organization controls
- Audit trail viewer
- Billing/subscription settings (if SaaS)

## Tracking Metrics
- DSO (days sales outstanding)
- Collection rate
- Average invoice value
- Repeat purchase rate
- Failed payment rate

---

# 16. Missing Enterprise Features

High-priority enterprise gaps:
- Offline support for data capture and queued sync
- Background sync for pending mutations
- Push notifications for due/overdue invoices
- Role-based access control and permissions
- Feature flags and remote config
- Localization/i18n and currency/locale formatting strategy
- Audit logs for security-sensitive actions
- Real-time updates via websocket/sse
- Query caching/invalidation policy unification
- Optimistic updates with rollback
- Session timeout and forced token refresh
- Structured error reporting pipeline
- App update strategy (mandatory/min version checks)

---

# 17. Scalability Review

## Can Current Architecture Scale?
- Short-term: yes for small team and moderate feature growth.
- Long-term: current mobile legacy patterns and split web strategy will slow scale.

## Team Scalability
- Current structure is understandable, but duplicated paradigms increase onboarding time.
- Lack of shared typed contracts can cause cross-team API regressions.

## Code Maintainability
- Domain separation exists, but UI/business coupling and large components reduce maintainability.

## Monorepo Feasibility
- Strongly feasible and already partially present.
- Should be formalized with shared packages:
  - api-contracts
  - ui-tokens
  - shared-utils

## Modularization Opportunities
- Feature folders by domain with internal components/hooks/services/tests.
- Shared API client package used by both mobile and web-app.

---

# 18. Technical Debt

## Anti-Patterns
- redux-form global form state for all mobile forms.
- Class components with extensive lifecycle/imperative logic.
- String action types scattered across files.

## Dangerous Implementations
- Android release uses debug signing config.
- Splash failure path exits app after 4 seconds.
- Token logging in auth actions.

## Tight Coupling
- Form pages tightly coupled to Redux state shape and action side effects.
- Navigation helper Actions object mirrors route names manually, risk of drift.

## Hardcoded Values
- base URLs and LAN IP in app.json.
- fixed timeout 5000 ms in API race.
- hardcoded colors/styles repeated in many components.

## Duplicate Logic
- Similar loading/success/fail reducer patterns across domains.
- Similar refresh-after-save patterns in forms.

## Potential Future Blockers
- web-app root page syntax corruption likely blocks build.
- endpoint contract mismatch between mobile and web-app.
- duplicated/legacy sections in ios Podfile can become build blocker during upgrades.

---

# 19. Recommended Future Architecture

## Ideal Frontend Architecture
Option recommended:
- Keep mobile as Expo React Native app.
- Keep Next app as dedicated web frontend.
- De-scope Expo web as primary product web path if SEO/admin UX is required.
- Share contracts and business logic in monorepo packages.

## Recommended State Management
Mobile:
- Redux Toolkit store
- RTK Query for server state
- Minimal UI state local to component/hooks
- react-hook-form for forms

Web-app:
- Continue RTK Query or consider TanStack Query + server components for selected routes
- Persist auth using secure cookies/session strategy

## Recommended API Architecture
- Create shared API contract definitions (types/schemas).
- Single endpoint naming convention across clients.
- Add refresh token mechanism and centralized auth middleware.
- Add retry/backoff and circuit-breaker behavior where appropriate.

## Recommended Folder Structure
Mobile (example):
- src/features/auth
- src/features/invoices
- src/features/customers
- src/features/items
- src/shared/ui
- src/shared/api
- src/shared/utils

Web-app similar feature modules under web-app/src/features with shared package consumption.

## Recommended UI System
- Mobile: complete Tamagui adoption with tokens, themes, and consistent primitives.
- Web: hardened design system primitives (button/input/table/modal/empty/error).
- Shared design tokens package for spacing/color/type scales.

## Recommended Performance Strategy
- Server-state caching/invalidation via RTK Query.
- Route-level code splitting and lazy loading.
- Replace heavyweight libs where possible.
- Add performance budgets and telemetry dashboards.

---

# 20. Executive Summary

## Top Critical Issues
1. Parallel web architectures (Expo web + Next app + root Next artifacts) causing strategic drift.
2. web-app route root file corruption and middleware auth not enforced.
3. Mobile legacy stack (redux-form + class components) increasing maintenance cost.
4. API contract mismatch between mobile and web-app endpoint conventions.
5. Build/release hardening gaps (Android debug signing in release config).

## Top Performance Risks
1. Full list refetches after each edit and splash all-or-nothing preload.
2. redux-form global state churn on form-heavy screens.
3. Large component complexity (InvoiceForm) and limited memoization.

## Top Security Risks
1. Inconsistent web auth persistence/guard strategy.
2. Token logs and incomplete token lifecycle handling.
3. Default HTTP base URLs and missing production hardening checklist.

## Top UX Improvements
1. Replace forced-exit splash failure with recoverable retry flow.
2. Improve loading/empty/error states in web-app pages.
3. Add advanced filters/search and stronger reporting UX.

## Top Architecture Improvements
1. Standardize on one web production strategy.
2. Migrate mobile to Redux Toolkit + RTK Query + react-hook-form.
3. Introduce shared API contracts and environment governance.
4. Establish observability (logging, crash reporting, metrics).

## Priority Order For Implementation
1. Stabilize web-app build/security baseline (fix root page, enforce middleware/session model).
2. Harden release and security fundamentals (signing, token logging removal, HTTPS env policy).
3. Align API contracts across mobile/web.
4. Start incremental mobile state/form modernization.
5. Introduce monitoring and performance telemetry.
6. Implement enterprise features (offline sync, RBAC, audit trail, feature flags).

---

## Appendix A: High-Signal File References
- Mobile app entry: App.js, src/Main.js
- Mobile navigation: src/components/Routes.js, src/utils/NavigationService.js
- Mobile store/persist: src/config/store.js, src/config/secureStorage.ts
- Mobile API transport: src/service/api.js
- Auth actions: src/actions/auth.actions.js
- Invoice flow: src/pages/form-pages/InvoiceForm.js, src/actions/invoice.actions.js
- Splash preload: src/pages/Splash.js
- Expo config: app.json, babel.config.js, metro.config.js, eas.json
- Android build config: android/build.gradle, android/app/build.gradle
- iOS pods: ios/Podfile

- Next app root: web-app/src/app/layout.tsx
- Next dashboard layout: web-app/src/app/(dashboard)/layout.tsx
- Next auth pages: web-app/src/app/(auth)/login/page.tsx, web-app/src/app/(auth)/signup/page.tsx
- Next API layer: web-app/src/store/apiSlice.ts
- Next auth state: web-app/src/store/authSlice.ts
- Next middleware: web-app/src/middleware.ts

- Root parallel Next artifacts: middleware.ts, apiSlice.ts, DashboardLayout.tsx

## Appendix B: Notable Validation Findings From Workspace Diagnostics
- TypeScript parse error pattern in JS files using generic syntax like Component<{}> (for example in src/pages/authentication/Login.js).
- android/app/build.gradle imports com.android.build.OutputFile which is unresolved in current AGP setup.
- tsconfig.json reports deprecated moduleResolution warning from inherited defaults in current TypeScript diagnostics.

