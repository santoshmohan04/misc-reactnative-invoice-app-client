# Frontend Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Architecture                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│   Mobile App     │                    │    Web App       │
│  React Native    │                    │    Next.js       │
│   (Expo 51)      │                    │  (16.2.6)        │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │        ┌──────────────────────────┐   │
         └────────┤  Shared Packages Layer   ├───┘
                  ├──────────────────────────┤
                  │ • api-contracts          │
                  │ • shared-api             │
                  │ • shared-utils           │
                  │ • shared-ui (TBD)        │
                  └────────────┬─────────────┘
                               │
                  ┌────────────┴──────────────┐
                  │      Backend API         │
                  │   Node.js / Express      │
                  │   (Port 5000)            │
                  └─────────────────────────┘
```

---

## Directory Structure

### Root Level
```
misc-reactnative-invoice-app-client/
├── src/                           # Mobile app (React Native)
│   ├── pages/                     # Screen components
│   │   ├── Splash.js             # Startup with retry logic
│   │   ├── Profile.js
│   │   ├── authentication/        # Auth screens
│   │   │   ├── Login.js
│   │   │   └── SignUp.js
│   │   ├── form-pages/            # CRUD forms
│   │   │   ├── InvoiceForm.js
│   │   │   ├── CustomerForm.js
│   │   │   └── ItemForm.js
│   │   └── main/                  # Dashboard screens
│   │       ├── Invoices.js
│   │       ├── Customers.js
│   │       ├── Items.js
│   │       └── Reports.js
│   ├── components/                # Reusable components
│   │   ├── NavBar.js
│   │   ├── MainPageHeader.js
│   │   ├── InnerPageHeader.js
│   │   ├── ListView.js
│   │   ├── Loader.js
│   │   ├── Logo.js
│   │   ├── EmptyListPlaceHolder.js
│   │   ├── Routes.js
│   │   └── reduxFormRenderers/    # Redux-form field renderers
│   ├── store/                     # Redux state management
│   │   ├── index.js
│   │   └── reducers/
│   │       ├── auth.reducer.js
│   │       ├── user.reducer.js
│   │       ├── invoice.reducer.js
│   │       ├── customer.reducer.js
│   │       └── item.reducer.js
│   ├── actions/                   # Redux thunks (to migrate)
│   │   ├── auth.actions.js
│   │   ├── invoice.actions.js
│   │   ├── customer.actions.js
│   │   └── item.actions.js
│   ├── service/                   # API client
│   │   └── api.js                 # Fetch wrapper with token handling
│   ├── utils/                     # Utilities
│   │   ├── currencies.utils.js
│   │   ├── error.utils.js
│   │   ├── general.utils.js
│   │   ├── NavigationService.js
│   │   └── redux.form.utils.js
│   ├── config/                    # Configuration
│   │   ├── store.js
│   │   └── secureStorage.ts
│   ├── assets/
│   │   └── images/
│   ├── Main.js
│   └── index.js
│
├── web-app/                       # Web app (Next.js)
│   ├── src/
│   │   ├── app/                   # Next.js app directory
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Home/redirect
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── (dashboard)/       # Protected routes
│   │   │       ├── layout.tsx     # Dashboard shell
│   │   │       ├── page.tsx       # Dashboard home
│   │   │       ├── invoices/page.tsx
│   │   │       ├── customers/page.tsx
│   │   │       ├── items/page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       ├── loading.tsx    # Skeleton loader
│   │   │       └── error.tsx      # Error boundary
│   │   ├── store/                 # Redux Toolkit
│   │   │   ├── index.ts           # Store with persistence
│   │   │   ├── authSlice.ts       # Auth state
│   │   │   ├── apiSlice.ts        # RTK Query endpoints
│   │   │   └── hooks.ts           # Typed hooks
│   │   ├── lib/                   # Utilities
│   │   │   ├── auth-cookie.ts     # Session cookies
│   │   │   ├── analytics/         # Analytics helpers
│   │   │   │   ├── buildSeries.ts
│   │   │   │   └── normalize.ts
│   │   │   └── ...
│   │   ├── components/            # React components
│   │   │   ├── providers.tsx      # SessionGuards provider
│   │   │   ├── ui/                # Primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── loader.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-state.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── index.ts
│   │   │   ├── analytics/         # Analytics components
│   │   │   │   ├── DateRangeFilter.tsx
│   │   │   │   ├── ChartCard.tsx
│   │   │   │   ├── RevenueTrendChart.tsx
│   │   │   │   ├── StatusDistributionChart.tsx
│   │   │   │   ├── PaymentOutcomeChart.tsx
│   │   │   │   ├── TopCustomersChart.tsx
│   │   │   │   └── ChartEmptyState.tsx
│   │   │   └── ...
│   │   ├── services/              # API clients
│   │   ├── hooks/                 # Custom hooks
│   │   ├── types/                 # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/                 # Utilities
│   │   └── middleware.ts          # Auth middleware
│   ├── public/                    # Static assets
│   ├── next.config.ts             # Next.js config with transpilePackages
│   ├── tsconfig.json              # TS config with path aliases
│   └── package.json
│
├── packages/                      # Shared libraries
│   ├── api-contracts/             # API endpoint definitions
│   │   ├── src/
│   │   │   ├── endpoints.ts       # Endpoint constants
│   │   │   ├── auth.ts            # Auth DTOs
│   │   │   ├── common.ts          # Response envelopes
│   │   │   └── index.ts           # Barrel export
│   │   └── package.json
│   │
│   ├── shared-api/                # API layer utilities
│   │   ├── src/
│   │   │   ├── types.ts           # Session, refresh types
│   │   │   ├── refreshMutex.ts    # Concurrent refresh prevention
│   │   │   ├── tokenExtractors.ts # Header/body extraction
│   │   │   ├── retry.ts           # Retry strategies
│   │   │   └── index.ts           # Barrel export
│   │   └── package.json
│   │
│   ├── shared-utils/              # Utilities
│   │   ├── src/
│   │   │   ├── errors/
│   │   │   │   ├── types.ts
│   │   │   │   └── mapApiError.ts
│   │   │   ├── env/
│   │   │   │   └── validateEnv.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared-ui/                 # Shared UI components (placeholder)
│       ├── src/
│       │   ├── components/
│       │   └── index.ts
│       └── package.json
│
├── android/                       # Android native code
├── ios/                           # iOS native code
├── MIGRATION.md                   # Phase migration guide
├── ARCHITECTURE.md                # This file
├── package.json                   # Root workspace config
└── ...
```

---

## Data Flow

### Authentication Flow

```
┌─────────────┐
│ Login Form  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│ POST /user/login             │
│ Payload: { email, password } │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ Backend Response (ApiEnvelope)                  │
│ {                                               │
│   success: true,                                │
│   data: {                                       │
│     access_token: "jwt...",                     │
│     refresh_token: "jwt...",                    │
│     user: { id, email, name, ... }             │
│   }                                             │
│ }                                               │
└──────┬────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ RTK Query apiSlice.login endpoint       │
│ • Unwraps success.data                  │
│ • Extracts tokens via tokenExtractors   │
│ • Dispatches setCredentials action      │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Redux authSlice.setCredentials           │
│ • Sets user, token, refreshToken        │
│ • Updates isAuthenticated flag           │
│ • Triggers localStorage sync             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ setAuthCookie(token)                    │
│ • HttpOnly cookie, 7-day max-age        │
│ • SameSite=strict for security           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Navigate to /dashboard                  │
│ Middleware validates cookie at edge      │
└──────────────────────────────────────────┘
```

### Token Refresh Flow

```
┌─────────────────────────┐
│ Make API Request        │
│ (with old token)        │
└──────┬──────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ Response Status Check                     │
│ • 401? → Trigger refresh                 │
│ • 200? → Return data                     │
│ • Other? → Return error                  │
└──────┬────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ refreshMutex.acquire()                    │
│ (Prevent concurrent refresh calls)        │
└──────┬────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ POST /user/refresh                        │
│ Body: { refresh_token: "jwt..." }        │
│ (Fallback: POST /auth/refresh)           │
└──────┬────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ Extract New Tokens                        │
│ • Try headers: x-auth, x-access-token    │
│ • Try body: data.access_token            │
│ • Update Redux authSlice                 │
└──────┬────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ Retry Original Request                    │
│ (with new token)                          │
└──────┬────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ Return Data or Error                      │
│ Release refreshMutex                      │
└───────────────────────────────────────────┘
```

### Analytics Data Flow

```
┌──────────────────────────────┐
│ Analytics Page Loaded        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ RTK Query Hooks                                          │
│ • useGetInvoicesQuery()                                 │
│ • useGetCustomersQuery()                                │
│ Cache invalidation: Invoice, Customer tags              │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ API Response                                             │
│ invoices: [                                             │
│   { id, customer_id, amount, status, issued, items }   │
│ ]                                                       │
│ customers: [                                            │
│   { id, name, email, company }                         │
│ ]                                                       │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ DateRangeFilter Component                               │
│ • Selects date range (default: last 90 days)           │
│ • Calls filterByDateRange(invoices, range)             │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Analytics Series Builders (lib/analytics/buildSeries)   │
│ • buildRevenueTrend(invoices)                           │
│ • buildInvoiceStatusDistribution(invoices)              │
│ • buildPaymentOutcomeSeries(invoices)                   │
│ • buildTopCustomers(invoices, customers)                │
│ Output: recharts-compatible series data                 │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Chart Components                                         │
│ • RevenueTrendChart (LineChart)                         │
│ • StatusDistributionChart (PieChart)                    │
│ • PaymentOutcomeChart (BarChart)                        │
│ • TopCustomersChart (BarChart)                          │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Visual Rendering                                         │
│ • Responsive containers                                 │
│ • ChartEmptyState if no data                            │
│ • Loading skeletons during fetch                        │
└──────────────────────────────────────────────────────────┘
```

---

## State Management

### Redux Store Structure (Web)

```typescript
// web-app/src/store/index.ts
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,              // User, tokens, isAuthenticated
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware),       // RTK Query middleware
});

// Persists to localStorage on changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('auth', JSON.stringify({
    user: state.auth.user,
    token: state.auth.token,
    refreshToken: state.auth.refreshToken,
    isAuthenticated: state.auth.isAuthenticated,
  }));
});
```

### Auth Slice

```typescript
// web-app/src/store/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

// Actions:
// • setCredentials({ user, access_token, refresh_token })
// • setUser(user)
// • updateTokens({ access_token, refresh_token })
// • logout()
// • setError(error)
```

### API Slice (RTK Query)

```typescript
// web-app/src/store/apiSlice.ts
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,  // Custom auth wrapper
  tagTypes: ['User', 'Invoice', 'Customer', 'Item'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({}),
    register: builder.mutation<RegisterResponse, RegisterRequest>({}),
    
    // Data endpoints with cache tags
    getInvoices: builder.query<Invoice[], void>({
      query: () => API_ENDPOINTS.INVOICE.GET_ALL,
      providesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),
    
    // Mutations invalidate cache
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({ url: API_ENDPOINTS.INVOICE.CREATE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),
  }),
});
```

### Redux (Mobile) - Pre-RTK Migration

```javascript
// src/store/reducers/auth.reducer.js
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Actions dispatched from src/actions/auth.actions.js thunks
```

---

## API Contract Layer

### Endpoint Definitions

```typescript
// packages/api-contracts/src/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    LOGOUT: '/user/logout',
    REFRESH: '/user/refresh',  // Fallback: /auth/refresh
  },
  USER: {
    GET_PROFILE: '/user/user',
  },
  INVOICE: {
    GET_ALL: '/invoice/all',
    GET_ONE: '/invoice/:id',
    CREATE: '/invoice/create',
    EDIT: '/invoice/edit',
    DELETE: '/invoice/delete',
  },
  CUSTOMER: {
    GET_ALL: '/customer/all',
    CREATE: '/customer/create',
    EDIT: '/customer/edit',
    DELETE: '/customer/delete',
  },
  ITEM: {
    GET_ALL: '/item/all',
    CREATE: '/item/create',
    EDIT: '/item/edit',
    DELETE: '/item/delete',
  },
};
```

### Response Envelope

```typescript
// packages/api-contracts/src/common.ts
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

### Data Types

```typescript
// web-app/src/types/index.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  company?: string;
  base_currency?: string;
  tax_id?: string;
}

export interface Invoice {
  _id: string;
  customer_id: string;
  customer?: Customer;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issued: string;  // ISO date
  items?: InvoiceItem[];
  notes?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface Item {
  _id: string;
  name: string;
  description?: string;
  unit_price: number;
  quantity?: number;
  unit?: string;
}
```

---

## Security Architecture

### Authentication Layers

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: Edge Middleware (Next.js)                     │
├────────────────────────────────────────────────────────┤
│ Validates auth_token cookie for /dashboard/* routes   │
│ Redirects unauthenticated to /login at edge           │
│ Result: Fast 307 redirect before any JS runs          │
└────────────────────────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: Client-Side Route Guard (React)              │
├────────────────────────────────────────────────────────┤
│ useEffect checks isAuthenticated in dashboard layout  │
│ Redirects to /login if not authenticated              │
│ Fallback for JavaScript-dependent checks              │
└────────────────────────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: API Interceptor (RTK Query)                  │
├────────────────────────────────────────────────────────┤
│ baseQueryWithReauth adds Authorization header         │
│ Automatically refreshes token on 401 response         │
│ Retries request with new token                        │
└────────────────────────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Session Timeout Guard (React Context)        │
├────────────────────────────────────────────────────────┤
│ Monitors user activity (click, keydown, mousemove)   │
│ Auto-logout after 30 minutes of inactivity            │
│ Clears all auth state + cookies + API cache          │
└────────────────────────────────────────────────────────┘
```

### Token Storage Strategy

```
Local Storage (Redux state):
├─ user           (sensitive: profile data)
├─ token          (sensitive: JWT access token)
├─ refreshToken   (sensitive: JWT refresh token)
└─ isAuthenticated (public: boolean flag)

HttpOnly Cookies (Session):
└─ auth_token     (JWT, 7-day max-age, secure for middleware)
   ├─ httpOnly: true    (JS cannot access)
   ├─ secure: true      (HTTPS only)
   ├─ sameSite: strict  (CSRF protection)
   └─ path: /

Memory (During runtime):
├─ store.getState().auth.*  (Redux store)
├─ useAuth hook            (Redux selector)
└─ Session context timeout ID
```

**Rationale**:
- **Cookies**: Used by edge middleware for request-time validation (no JS execution)
- **localStorage**: Survives page reloads; hydrates Redux on init
- **Redux memory**: Current session state for immediate access
- **No XSS vector**: Tokens in httpOnly cookies can't be stolen by JavaScript

---

## Error Handling

### Error Mapping

```typescript
// packages/shared-utils/src/errors/mapApiError.ts
export enum ApiErrorKind {
  UNAUTHORIZED = 'UNAUTHORIZED',           // 401
  FORBIDDEN = 'FORBIDDEN',                 // 403
  NOT_FOUND = 'NOT_FOUND',                 // 404
  VALIDATION_ERROR = 'VALIDATION_ERROR',   // 422
  CONFLICT = 'CONFLICT',                   // 409
  SERVER_ERROR = 'SERVER_ERROR',           // 5xx
  NETWORK_ERROR = 'NETWORK_ERROR',         // Fetch error
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  kind: ApiErrorKind;
  message: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

export function mapApiError(error: unknown): AppError {
  // Converts fetch/RTK errors to consistent AppError shape
}
```

### Error UI Components

```typescript
// web-app/src/components/ui/error-state.tsx
<ErrorState
  title="Failed to load invoices"
  message="Check your connection or try again."
  onRetry={() => refetch()}
/>

// web-app/src/app/(dashboard)/error.tsx
export default function Error({ error, reset }: any) {
  return (
    <ErrorState
      title="Something went wrong"
      message={error.message}
      onRetry={reset}
    />
  );
}
```

---

## Performance Considerations

### Web App (Next.js)

1. **Code Splitting**
   - Next.js automatically splits routes
   - RTK Query generates typed hooks (tree-shakeable)

2. **Data Fetching**
   - RTK Query provides caching + deduplication
   - Use `skip` option to prevent unnecessary requests
   - `providesTags`/`invalidatesTags` for cache busting

3. **Analytics Optimization**
   - Build series data on-demand (not in render)
   - Memoize chart components with `React.memo`
   - Use `useMemo` for expensive computations

### Mobile App (React Native)

1. **Splash Load Time**
   - Parallel asset loading (Promise.allSettled)
   - Timeout protection (force progress after 8s)
   - Graceful degradation (proceed with partial data)

2. **List Performance** (Future improvement)
   - Memoize list items with `React.memo`
   - Implement `FlashList` instead of `FlatList`
   - Virtualize long lists

3. **Bundle Size** (Future improvement)
   - Remove unused Tamagui components
   - Tree-shake redux-form library (Phase 2)
   - Analyze bundle with `react-native-bundle-visualizer`

---

## Testing Strategy

### Unit Tests
```typescript
// Example: Token extraction
import { extractAccessToken } from '@shared-api';

describe('extractAccessToken', () => {
  it('extracts from x-auth header', () => {
    const token = extractAccessToken({}, { 'x-auth': 'jwt...' });
    expect(token).toBe('jwt...');
  });

  it('extracts from response body', () => {
    const token = extractAccessToken({ access_token: 'jwt...' }, {});
    expect(token).toBe('jwt...');
  });
});
```

### Integration Tests
```typescript
// Example: Login flow
describe('Auth Flow', () => {
  it('logs in user and sets tokens', async () => {
    const { store } = renderWithRedux(<App />);
    
    // Login
    await userEvent.click(screen.getByText('Login'));
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    
    // Verify tokens set
    expect(store.getState().auth.token).toBeDefined();
    expect(getAuthCookie()).toBe(store.getState().auth.token);
  });
});
```

### E2E Tests (Playwright)
```typescript
test('Full user journey', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.click('button[type="submit"]');
  
  // 2. View dashboard
  await page.waitForURL('/dashboard');
  expect(page.url()).toContain('/dashboard');
  
  // 3. Timeout and logout
  await page.waitForTimeout(31 * 60 * 1000);
  await page.waitForURL('/login?reason=timeout');
});
```

---

## Deployment

### Web App (Next.js)

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy

# Or Docker
docker build -t invoice-web .
docker run -p 3000:3000 invoice-web
```

### Mobile App (Expo)

```bash
# Publish to Expo
eas build --platform all
eas submit --platform all

# Or local testing
expo start
```

---

## Key Files & Their Purposes

| File | Purpose | Tech Stack |
|------|---------|-----------|
| [web-app/src/store/apiSlice.ts](web-app/src/store/apiSlice.ts) | RTK Query API definitions | RTK Query |
| [web-app/src/store/authSlice.ts](web-app/src/store/authSlice.ts) | Auth state management | Redux Toolkit |
| [web-app/src/middleware.ts](web-app/src/middleware.ts) | Edge auth validation | Next.js middleware |
| [web-app/src/lib/auth-cookie.ts](web-app/src/lib/auth-cookie.ts) | Session cookies | js-cookie |
| [web-app/src/components/providers.tsx](web-app/src/components/providers.tsx) | SessionGuards timeout | React Context |
| [packages/api-contracts/src/endpoints.ts](packages/api-contracts/src/endpoints.ts) | Endpoint constants | TypeScript |
| [packages/shared-api/src/refreshMutex.ts](packages/shared-api/src/refreshMutex.ts) | Concurrent refresh prevention | Async mutex |
| [src/pages/Splash.js](src/pages/Splash.js) | Mobile startup with retry | React Native |
| [web-app/src/app/(dashboard)/analytics/page.tsx](web-app/src/app/(dashboard)/analytics/page.tsx) | Analytics dashboard | Next.js + Recharts |

---

## Future Improvements

1. **Type Safety**: Migrate mobile to TypeScript (Phase 2)
2. **State Management**: RTK Query for mobile (Phase 2)
3. **Forms**: react-hook-form + Zod for mobile forms (Phase 2)
4. **Design System**: Formalize shared-ui with Storybook (Phase 3)
5. **Monitoring**: Add Sentry error tracking (Phase 3)
6. **Analytics**: Event tracking with custom dashboard (Phase 3)
7. **Offline-First**: Redux Offline for mobile resilience (Phase 4)
8. **Performance**: FlashList, memoization, code splitting (Phase 2-3)

---

**Last Updated**: Phase 1 Complete  
**Architecture Version**: 1.0  
**Maintained By**: Development Team
