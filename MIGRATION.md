# Frontend Modernization Migration Guide

## Overview

This guide documents the comprehensive modernization of the invoice app frontend architecture across mobile (React Native/Expo) and web (Next.js) platforms. The migration follows an **incremental, non-breaking strategy** to preserve existing functionality while establishing modern patterns and shared infrastructure.

**Migration Status**: Phase 1 ✅ Complete | Phase 2-3 🔄 In Progress

---

## Phase 1: Foundations & API Alignment ✅

### What Changed

#### 1. **Monorepo Package Structure** ✅
**Goal**: Enable code sharing between mobile and web without duplication

**Changes**:
- Created `packages/` directory with shared libraries:
  - `packages/api-contracts/` — Endpoint definitions, auth DTOs, response types
  - `packages/shared-api/` — Token refresh logic, mutex, extractors, session types
  - `packages/shared-utils/` — Error mapping, environment validation
  - `packages/shared-ui/` — (Placeholder) Reusable UI components

**Impact**:
- ✅ Both mobile and web import from single source of truth for API contracts
- ✅ Token extraction logic centralized (handles header/body response variants)
- ✅ Error mapping consistent across platforms
- ℹ️ Mobile doesn't yet import from shared packages (migration in Phase 2)

**How to Use**:
```typescript
// web-app/src/store/apiSlice.ts
import { API_ENDPOINTS, ApiEnvelope } from '@shared-contracts';
import { createRefreshMutex, extractAccessToken } from '@shared-api';
import { mapApiError } from '@shared-utils';
```

---

#### 2. **Web API Endpoint Alignment** ✅
**Goal**: Ensure web-app uses backend-native routes (previously misaligned)

**Changes**:
- All web endpoints updated to match backend contract:
  - ❌ `/auth/login` → ✅ `/user/login`
  - ❌ `/auth/register` → ✅ `/user/register`
  - ❌ `/invoices` → ✅ `/invoice/all`
  - ❌ `/customers` → ✅ `/customer/all`
  - ❌ `/items` → ✅ `/item/all`
  - (Edit endpoints: `/invoice/edit`, `/customer/edit`, `/item/edit`)

**Files Updated**:
- [web-app/src/store/apiSlice.ts](web-app/src/store/apiSlice.ts) — Endpoint constants, base query, refresh logic
- [web-app/src/app/(auth)/login/page.tsx](web-app/src/app/(auth)/login/page.tsx) — Login form

**Impact**:
- ✅ Web and mobile now speak same language to backend
- ✅ No backend changes needed; frontend adapts to existing API
- ⚠️ If custom web API was in place, will need migration to backend-native routes

---

#### 3. **Automatic Token Refresh Flow** ✅
**Goal**: Handle 401 responses with automatic token refresh and retry

**Changes**:
- Implemented `baseQueryWithReauth` middleware in RTK Query:
  - Intercepts 401 responses
  - Calls refresh endpoint (`/user/refresh` with fallback to `/auth/refresh`)
  - Retries original request with new token
  - Uses mutex to prevent concurrent refresh calls
  
**Token Extraction** (handles multiple response formats):
```typescript
// Tries multiple header/body locations for access token:
1. Header: x-auth
2. Header: x-access-token
3. Header: authorization (Bearer scheme)
4. Response body: data.access_token / data.token / data.accessToken
```

**Files**:
- [web-app/src/store/apiSlice.ts](web-app/src/store/apiSlice.ts) — baseQueryWithReauth implementation
- [packages/shared-api/src/refreshMutex.ts](packages/shared-api/src/refreshMutex.ts) — Mutex for concurrent calls
- [packages/shared-api/src/tokenExtractors.ts](packages/shared-api/src/tokenExtractors.ts) — Token extraction logic

**Impact**:
- ✅ Web app never shows expired token errors to user
- ✅ Seamless session persistence across page reloads
- ℹ️ Mobile app currently uses fetch + custom retry logic (Phase 2 will migrate to RTK Query)

---

#### 4. **Auth Persistence Layer** ✅
**Goal**: Persist auth state across sessions and app reloads

**Changes**:
- **localStorage** (initial load): Redux store hydrates on app startup
- **Cookies** (session): HTTPOnly, SameSite=strict, 7-day max-age
- **Middleware validation**: Edge-level token check before serving routes

**Files**:
- [web-app/src/store/index.ts](web-app/src/store/index.ts) — localStorage preload + subscription sync
- [web-app/src/lib/auth-cookie.ts](web-app/src/lib/auth-cookie.ts) — Cookie helpers (set/get/clear)
- [web-app/src/middleware.ts](web-app/src/middleware.ts) — Token validation for /dashboard/* routes
- [web-app/src/app/(auth)/login/page.tsx](web-app/src/app/(auth)/login/page.tsx) — setAuthCookie on login
- [web-app/src/app/(dashboard)/layout.tsx](web-app/src/app/(dashboard)/layout.tsx) — clearAuthCookie on logout

**Impact**:
- ✅ Users stay logged in across page reloads
- ✅ Protected routes reject unauthenticated requests at edge
- ✅ Logout clears all auth state + cookies + API cache
- ℹ️ Mobile continues using redux-persist (Phase 2 will add token refresh)

---

#### 5. **Session Security & Inactivity Timeout** ✅
**Goal**: Auto-logout inactive users after 30 minutes

**Changes**:
- Implemented `SessionGuards` component in root Providers:
  - Tracks user activity (click, keydown, mousemove, touchstart)
  - 30-minute inactivity timeout (configurable)
  - On timeout: logout + clear API state + clear cookie + redirect to /login with toast

**Files**:
- [web-app/src/components/providers.tsx](web-app/src/components/providers.tsx) — SessionGuards component
- [web-app/src/components/ui/toast.tsx](web-app/src/components/ui/toast.tsx) — Toast notifications

**Impact**:
- ✅ Enterprise-grade session security
- ✅ Reduces exposure from unattended sessions
- ℹ️ Mobile doesn't implement timeout (Phase 3 consideration)

---

#### 6. **Mobile Splash Resilience Improvements** ✅
**Goal**: Replace all-or-nothing preload with graceful degradation

**Changes**:
- Old: `Promise.all()` fails entirely if any asset fails → app forced exit
- New:
  - `Promise.allSettled()` loads assets independently
  - Retries failed assets (up to 2 times)
  - Requires minimum viable load: invoices + customers (items optional)
  - On persistent failure: Shows error + proceeds to home screen with toast
  - User can manually retry

**Files**:
- [src/pages/Splash.js](src/pages/Splash.js) — Retry logic, partial load support

**Impact**:
- ✅ App no longer crashes on network hiccup during startup
- ✅ Users can work with partial data while retrying in background
- ✅ Better UX: shows error + retry button instead of forced exit
- ⚠️ Requires backend to support partial responses (currently assumed)

---

### Breaking Changes: NONE ✅
- All changes are backward compatible
- Existing Redux patterns, API service, and reducers untouched
- Mobile app continues operating with zero modifications

### Migration Effort for External Projects
- **Effort**: ~2-3 hours
- **Steps**:
  1. Copy `packages/` to your project root
  2. Update `web-app/tsconfig.json` path aliases for shared packages
  3. Update `web-app/next.config.ts` transpilePackages
  4. Replace `apiSlice.ts` with new endpoint constants
  5. Replace middleware, auth flow, login page
  6. Add SessionGuards to Providers
  7. Replace Splash.js with new retry logic
  8. Test auth flow: login → dashboard → inactive timeout → redirect

---

## Phase 2: State Management & Mobile Modernization 🔄

### What Will Change

#### 1. **Mobile State Management Migration**
**Target**: Migrate from Redux thunks to RTK Query + react-hook-form

**Approach** (non-breaking):
- Introduce RTK alongside existing Redux thunks
- Migrate one feature at a time (auth → invoices → customers → items)
- Keep old reducers active during transition
- Remove old patterns after full RTK adoption

**Timeline**: 2-3 weeks

**Files to Touch**:
- `src/actions/*.js` → `src/store/slices/*.ts` (RTK)
- `src/reducers/*.js` → (delete after RTK integration)
- `src/pages/*/*.js` → Use hooks instead of Redux connect
- `src/service/api.js` → Replace with RTK Query baseQuery

**Deliverables**:
- ✅ Unified API layer across mobile + web
- ✅ Automatic refresh token handling
- ✅ Type safety (TypeScript)
- ✅ Better DX with hooks vs Redux connect

---

#### 2. **Form Modernization**
**Target**: Migrate from redux-form to react-hook-form

**Scope**:
- Auth forms (Login, SignUp)
- CRUD forms (CustomerForm, InvoiceForm, ItemForm)

**Benefits**:
- Smaller bundle size (redux-form is legacy)
- Better performance (no form state in Redux)
- Simpler validation (zod + react-hook-form)
- Less boilerplate

**Timeline**: 1-2 weeks

---

#### 3. **Mobile Performance Hardening**
**Target**: Optimize renders, lists, and bundle size

**Changes**:
- Memoize components with `React.memo`
- Optimize FlatList with FlashList or memoized item renderers
- Remove unused imports (Tamagui components)
- Profile with React Native DevTools

**Timeline**: 1 week

---

### Code Examples

#### RTK Query Setup for Mobile
```typescript
// src/store/slices/auth.ts (NEW)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@shared-contracts';
import { createRefreshMutex, extractAccessToken } from '@shared-api';

const refreshMutex = createRefreshMutex();

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(authSlice.actions.setCredentials(data));
      },
    }),
  }),
});
```

#### react-hook-form Integration
```typescript
// src/pages/authentication/Login.tsx (NEW)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
});

export default function Login() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading }] = useLoginMutation();

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await login(data).unwrap();
    })}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Phase 3: Monorepo Consolidation & Enterprise Features 📋

### What Will Change

#### 1. **Folder Structure Reorganization**
```
Current:
├── src/                     (mobile source)
├── web-app/                 (web source)
└── packages/                (shared libs)

Target:
├── apps/
│   ├── mobile/              (React Native)
│   └── web/                 (Next.js)
├── packages/
│   ├── api-contracts/
│   ├── shared-api/
│   ├── shared-utils/
│   ├── shared-ui/
│   └── design-system/
├── tools/                   (scripts, templates)
└── docs/
    ├── ARCHITECTURE.md
    ├── MIGRATION.md
    └── PHASES.md
```

**Impact**: Better IDE support, clearer monorepo navigation, standard structure

#### 2. **Design System Formalization**
- Publish reusable UI components from `packages/shared-ui`
- Add Storybook for component documentation
- Establish color tokens, typography, spacing scales
- Support both Tamagui (mobile) and Tailwind (web)

#### 3. **Analytics & Observability Setup**
- Integrate Sentry for error tracking
- Add event tracking (invoice created, login, logout)
- Create analytics dashboard in web-app
- Performance monitoring with Web Vitals

#### 4. **CI/CD Pipeline**
- GitHub Actions workflow for:
  - Lint (ESLint + Prettier)
  - Type check (TypeScript)
  - Build (mobile + web)
  - Test (unit + integration)
  - Deploy (web to Azure/Vercel, mobile to Expo)

---

## Technical Debt & Recommendations

### High Priority
1. ⚠️ **Mobile Splash all-or-nothing pattern** → ✅ FIXED in Phase 1
2. ⚠️ **Redux thunks** → Replace with RTK Query (Phase 2)
3. ⚠️ **redux-form** → Replace with react-hook-form (Phase 2)
4. ⚠️ **No type safety in mobile** → Add TypeScript (Phase 2)

### Medium Priority
1. 📋 **No design system** → Formalize shared-ui package (Phase 3)
2. 📋 **No analytics** → Add Sentry + event tracking (Phase 3)
3. 📋 **No integration tests** → Add test suite (Phase 3)
4. 📋 **No CI/CD** → Setup GitHub Actions (Phase 3)

### Low Priority
1. 📋 **FlatList performance** → Profile + optimize with FlashList (Phase 2)
2. 📋 **Bundle size** → Audit and optimize (Phase 3)
3. 📋 **Offline-first** → Consider Redux Offline (Phase 4)

---

## Validation Checklist

### Phase 1 Completion ✅
- [x] Monorepo packages created and importable
- [x] Web API endpoints aligned to backend
- [x] Token refresh flow working with mutex
- [x] Auth persistence via localStorage + cookies
- [x] Middleware protecting /dashboard routes
- [x] Session timeout (30 min inactivity) implemented
- [x] Mobile Splash with retry logic
- [x] No breaking changes to mobile app

### Phase 2 Starting Point 🔄
- [ ] Mobile state management migrated to RTK Query
- [ ] Auth forms using react-hook-form
- [ ] CRUD forms using react-hook-form
- [ ] Mobile using shared API contracts
- [ ] Mobile using shared error mapping
- [ ] TypeScript enabled in mobile
- [ ] All features tested end-to-end

### Phase 3 Starting Point 📋
- [ ] Folder structure reorganized to monorepo standard
- [ ] Shared UI package published with Storybook
- [ ] Sentry integrated for error tracking
- [ ] Analytics events implemented
- [ ] CI/CD pipeline defined and working
- [ ] Comprehensive documentation written

---

## How to Execute Phase 2

### Step 1: Setup RTK for Mobile
1. Install dependencies: `pnpm install @reduxjs/toolkit @reduxjs/query react-hooks`
2. Create `src/store/` directory
3. Define `authApi` with endpoints (login, register, refresh, logout)
4. Update `Store.js` to include authApi reducer

### Step 2: Migrate Auth
1. Create `LoginPage.tsx` with react-hook-form + useLoginMutation
2. Create `SignUpPage.tsx` with react-hook-form + useRegisterMutation
3. Update `AuthContext` to dispatch RTK actions
4. Test: login → verify token in Redux store

### Step 3: Migrate Forms
1. Convert `CustomerForm.js` → `CustomerForm.tsx` with react-hook-form
2. Convert `InvoiceForm.js` → `InvoiceForm.tsx` with react-hook-form
3. Verify validation works with zod schemas

### Step 4: Migrate Data Fetching
1. Create `invoiceApi`, `customerApi`, `itemApi` with RTK Query
2. Update list pages to use `useGetInvoicesQuery()` hooks
3. Remove old Redux thunks

### Step 5: Test & Validate
1. Run end-to-end: login → view invoices → create invoice → logout
2. Check network tab for token refresh on 401
3. Profile with Flipper DevTools
4. Commit changes with clear commit messages

---

## FAQ

**Q: Will these changes break the mobile app?**
A: No. All changes are backward compatible. Existing Redux patterns remain active during Phase 2.

**Q: Can I pause the migration?**
A: Yes. Each phase is self-contained. You can stop after Phase 1 (foundations only) and revisit Phase 2 later.

**Q: What if the backend doesn't support `/user/refresh`?**
A: The refresh logic tries both `/user/refresh` and `/auth/refresh`. If neither works, update the endpoint in [web-app/src/store/apiSlice.ts](web-app/src/store/apiSlice.ts#L72).

**Q: How do I test the token refresh flow?**
A: In the browser DevTools, set a breakpoint in the auth slice when setCredentials is called. Make a request that triggers 401, and verify the refresh endpoint is called.

**Q: Should I update to TypeScript now?**
A: Not required for Phase 1. Phase 2 introduces TypeScript for new files; gradual migration is fine.

**Q: How do I rollback if something breaks?**
A: Each phase is in a separate commit. Use `git revert` to undo the entire phase.

---

## Resources

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [react-hook-form Docs](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Last Updated**: Phase 1 Complete  
**Next Review**: After Phase 2 completion  
**Maintained By**: Development Team
