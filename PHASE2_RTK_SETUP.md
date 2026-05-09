# Phase 2: Mobile State Management Modernization - Complete

## Overview

Phase 2 establishes modern state management and form handling for the mobile app using RTK Query and react-hook-form, enabling seamless synchronization with the web app and shared API contracts.

**Status**: ✅ Foundation Complete | 🔄 Form Migration In Progress

---

## What Was Implemented

### 1. RTK Store Setup ✅

**File**: `src/store/index.ts`

- Configured Redux store with RTK + RTK Query
- Integrated redux-persist for offline support
- Added TypeScript type exports (RootState, AppDispatch)

**Key Features**:
- Auth state persisted to AsyncStorage
- Serializablecheck configured for RTK compatibility
- Middleware stack includes authApi + dataApi

```typescript
import { store, persistor } from './src/store';

<Provider store={store}>
  <PersistGate persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

---

### 2. Auth Slice (Redux) ✅

**File**: `src/store/slices/authSlice.ts`

Manages auth state (separate from API data):

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions:
// - setCredentials(user, access_token, refresh_token)
// - setUser(user)
// - updateTokens(access_token, refresh_token)
// - logout()
// - setError(error)
// - setLoading(boolean)
// - clearError()
```

---

### 3. Auth API (RTK Query) ✅

**File**: `src/store/apis/authApi.ts`

Provides login, register, logout, and getCurrentUser endpoints with automatic token refresh:

```typescript
// Usage in components:
const [login, { isLoading, error }] = useLoginMutation();
const { data: user } = useGetCurrentUserQuery();
const [logout] = useLogoutUserMutation();

// Login example:
await login({ email, password }).unwrap();
// Automatically sets credentials in Redux
```

**Key Features**:
- Custom `baseQueryWithReauth` middleware
- Automatic 401 refresh with mutex (prevents concurrent calls)
- Token extraction handles multiple header/body formats
- Fallback to `/auth/refresh` if `/user/refresh` fails

---

### 4. Data API (RTK Query) ✅

**File**: `src/store/apis/dataApi.ts`

Provides CRUD endpoints for invoices, customers, and items:

```typescript
// Invoices
useGetInvoicesQuery()
useGetInvoiceQuery(id)
useCreateInvoiceMutation()
useUpdateInvoiceMutation()
useDeleteInvoiceMutation()

// Customers
useGetCustomersQuery()
useCreateCustomerMutation()
useUpdateCustomerMutation()
useDeleteCustomerMutation()

// Items
useGetItemsQuery()
useCreateItemMutation()
useUpdateItemMutation()
useDeleteItemMutation()
```

**Key Features**:
- Cache invalidation with tags (Invoice, Customer, Item)
- Automatic response unwrapping via `unwrapSuccessPayload`
- Authorization header automatically added from Redux state

---

### 5. Typed Hooks ✅

**File**: `src/store/hooks.ts`

Pre-typed Redux hooks for full TypeScript support:

```typescript
// Dispatch
const dispatch = useAppDispatch();

// Selectors
const { user, token, isAuthenticated } = useAuth();
const user = useAuthUser();
const token = useAuthToken();
const isAuth = useIsAuthenticated();
const error = useAuthError();
const loading = useAuthLoading();
```

---

### 6. TypeScript Configuration ✅

**File**: `tsconfig.json`

- Enabled strict mode
- Added path aliases for imports:
  - `@store/*` → `./src/store/*`
  - `@types/*` → `./src/types/*`
  - `@utils/*` → `./src/utils/*`
  - `@hooks/*` → `./src/hooks/*`
  - `@components/*` → `./src/components/*`
  - `@shared-*` → shared packages

```typescript
// Usage:
import { store } from '@store';
import { useAuth } from '@store/hooks';
import { LoginFormData } from '@types/schemas';
```

---

### 7. Form Validation Schemas ✅

**File**: `src/types/schemas.ts`

Zod schemas for all forms with full TypeScript inference:

```typescript
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

**Schemas Included**:
- `loginSchema` + LoginFormData
- `registerSchema` + RegisterFormData
- `customerSchema` + CustomerFormData
- `itemSchema` + ItemFormData
- `invoiceSchema` + InvoiceFormData

---

### 8. Entity Types ✅

**File**: `src/types/index.ts`

TypeScript interfaces for all entities:

```typescript
export interface User {
  _id?: string;
  email: string;
  name: string;
  company?: string;
  base_currency?: string;
}

export interface Invoice {
  _id?: string;
  customer_id: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issued: string;
  items?: InvoiceItem[];
}

// ... Customer, Item, ApiResponse, etc.
```

---

### 9. Environment Configuration ✅

**File**: `src/config/env.ts`

Dynamic API URL selection based on environment:

```typescript
// Usage:
const apiUrl = getApiUrl(); // Returns dev/staging/prod URL

// Override via env var:
// EXPO_PUBLIC_ENV=staging
// or
// EXPO_PUBLIC_API_URL=http://custom-api.com
```

**Environments**:
- `dev`: http://localhost:5000
- `staging`: https://staging-api.invoice-app.com
- `prod`: https://api.invoice-app.com

---

### 10. Modernized Auth Forms ✅

**File**: `src/pages/authentication/Login.tsx`  
**File**: `src/pages/authentication/SignUp.tsx`

Example of new form pattern using react-hook-form:

```typescript
function Login() {
  const [login, { isLoading, error }] = useLoginMutation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      // Auto-redirects when isAuthenticated changes
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="email"
        render={({ field }) => <TextInput {...field} />}
      />
      {errors.email && <Text>{errors.email.message}</Text>}
      {/* ... */}
    </form>
  );
}
```

---

### 11. Updated Root Components ✅

**File**: `App.js`  
**File**: `src/Main.js`

- App.js now imports store from new RTK setup
- Main.js converted to functional component using hooks
- Removed Redux connect() pattern

---

## Breaking Changes: NONE ✅

- Old Redux thunks still work (not removed)
- Old class components still work (navigation not changed)
- Backward compatible with Phase 1 changes

---

## How to Use RTK Query in Components

### Query Hook (Fetching Data)

```typescript
import { useGetInvoicesQuery } from '@store/apis/dataApi';

function InvoicesList() {
  const { data: invoices, isLoading, error } = useGetInvoicesQuery();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={invoices}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Mutation Hook (Creating/Updating)

```typescript
import { useCreateInvoiceMutation } from '@store/apis/dataApi';

function CreateInvoiceForm() {
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const handleSubmit = async (data) => {
    try {
      const result = await createInvoice(data).unwrap();
      console.log('Created:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Combining Queries

```typescript
function InvoiceDetail({ id }) {
  const { data: invoice } = useGetInvoiceQuery(id);
  const { data: customers } = useGetCustomersQuery();

  if (!invoice || !customers) return null;

  const customer = customers.find(c => c._id === invoice.customer_id);
  return <View>{customer?.name}</View>;
}
```

---

## How to Migrate Existing Components

### Before (Redux thunks + redux-form)

```javascript
// Old pattern
import { connect } from 'react-redux';
import { getInvoicesList } from '@actions/invoice.actions';
import { Field, reduxForm } from 'redux-form';

class Invoices extends Component {
  componentDidMount() {
    this.props.dispatch(getInvoicesList());
  }

  render() {
    const { invoices, isLoading } = this.props;
    return <FlatList data={invoices} {...} />;
  }
}

export default connect(
  state => ({ invoices: state.invoiceReducer.getInvoices.data }),
)(Invoices);
```

### After (RTK Query + react-hook-form)

```typescript
// New pattern
import { useGetInvoicesQuery } from '@store/apis/dataApi';
import { useForm, Controller } from 'react-hook-form';

function Invoices() {
  const { data: invoices, isLoading } = useGetInvoicesQuery();

  return isLoading ? <Loader /> : <FlatList data={invoices} {...} />;
}

export default Invoices;
```

---

## Phase 2 Migration Checklist

### Completed ✅
- [x] TypeScript setup with path aliases
- [x] RTK store with persistence
- [x] Auth slice + API with token refresh
- [x] Data API for CRUD operations
- [x] Typed hooks
- [x] Zod validation schemas
- [x] Entity types
- [x] Environment configuration
- [x] Example Login/SignUp forms
- [x] App.js + Main.js integration

### In Progress 🔄
- [ ] Migrate remaining auth screens
- [ ] Migrate CRUD forms (Customer, Invoice, Item)
- [ ] Update list screens to use RTK Query hooks
- [ ] Test auth flow with token refresh
- [ ] Performance profiling

### Planned (Phase 2 Part 2)
- [ ] Memoize components with React.memo
- [ ] Optimize FlatList with FlashList
- [ ] Remove old redux-form completely
- [ ] Remove old Redux thunks
- [ ] Test offline functionality
- [ ] Bundle size audit

---

## Testing Token Refresh Flow

### Scenario: Expired Token

1. User logs in successfully
2. Token stored in Redux + cookie
3. App makes API request with token
4. Backend returns 401 (token expired)
5. RTK Query interceptor catches 401
6. Calls `/user/refresh` with refreshToken
7. Backend returns new tokens
8. RTK Query updates Redux state
9. Original request retried with new token
10. User sees result (seamless refresh)

### Manual Testing

```typescript
// In a component, simulate expired token:
import { useAppDispatch } from '@store/hooks';
import { setCredentials } from '@store/slices/authSlice';

function TestComponent() {
  const dispatch = useAppDispatch();

  const expireToken = () => {
    dispatch(setCredentials({
      user: { email: 'test@example.com' },
      access_token: 'expired-token-' + Date.now(),
      refresh_token: 'valid-refresh-token',
    }));
  };

  // Now any API call will get 401 and trigger refresh
  return <Button onPress={expireToken} title="Expire Token" />;
}
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@store'"
**Solution**: Make sure tsconfig.json has the path alias configured correctly.

### Issue: "RTK Query cache not updating"
**Solution**: Ensure `invalidatesTags` is set on mutations:
```typescript
createInvoice: builder.mutation({
  // ...
  invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
})
```

### Issue: "useForm not triggering validation"
**Solution**: Make sure to use `zodResolver`:
```typescript
const { control } = useForm({
  resolver: zodResolver(loginSchema), // ← Required
});
```

### Issue: "Tokens not persisting across app restart"
**Solution**: Ensure PersistGate is wrapping your app:
```typescript
<Provider store={store}>
  <PersistGate persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

---

## Environment Variables

Create `.env` in project root:

```bash
# Development (default)
EXPO_PUBLIC_ENV=dev
EXPO_PUBLIC_API_URL=http://localhost:5000

# Staging
# EXPO_PUBLIC_ENV=staging

# Production
# EXPO_PUBLIC_ENV=prod
```

For Expo, use `EXPO_PUBLIC_` prefix for variables accessible in app.

---

## Next Steps (Phase 2 Continuation)

### Priority 1: Migrate Remaining Forms
1. Update CustomerForm.js → CustomerForm.tsx
2. Update InvoiceForm.js → InvoiceForm.tsx
3. Update ItemForm.js → ItemForm.tsx
4. Test all CRUD operations

### Priority 2: Update List Screens
1. Update Invoices.js to use useGetInvoicesQuery()
2. Update Customers.js to use useGetCustomersQuery()
3. Update Items.js to use useGetItemsQuery()
4. Add pull-to-refresh with RTK refetch

### Priority 3: Remove Old Patterns
1. Delete old Redux thunks (phase out gradually)
2. Replace redux-form completely
3. Clean up old action/reducer files

### Priority 4: Performance
1. Profile with React Native DevTools
2. Implement React.memo for list items
3. Evaluate FlashList for long lists
4. Measure bundle size impact

---

## File Structure Overview

```
src/
├── store/
│   ├── index.ts              (Store config + persistence)
│   ├── hooks.ts              (Pre-typed hooks)
│   ├── slices/
│   │   └── authSlice.ts      (Auth state)
│   └── apis/
│       ├── authApi.ts        (Auth endpoints + refresh)
│       └── dataApi.ts        (CRUD endpoints)
├── types/
│   ├── index.ts              (Entity types)
│   └── schemas.ts            (Zod form schemas)
├── config/
│   └── env.ts                (Environment config)
├── pages/
│   └── authentication/
│       ├── Login.tsx         (Modern form example)
│       └── SignUp.tsx        (Modern form example)
├── components/
│   ├── Routes.js             (Still using old pattern)
│   └── ...
├── actions/                  (Legacy, keep for compatibility)
├── reducers/                 (Legacy, keep for compatibility)
└── ...
```

---

## Summary

**Phase 2 Foundation Complete**:
- ✅ RTK store with persistence
- ✅ RTK Query APIs with auto-refresh
- ✅ Typed hooks for full TypeScript support
- ✅ Zod validation schemas
- ✅ Example modernized forms
- ✅ Environment configuration
- ✅ Zero breaking changes

**Next**: Migrate remaining forms and list screens to RTK Query pattern, then remove old Redux thunks.

---

**Last Updated**: Today  
**Status**: Phase 2 Foundation Complete  
**Next Phase**: Form & List Screen Migration
