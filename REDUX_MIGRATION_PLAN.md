# Redux Toolkit Migration: Thunk to RTK Query Complete Refactor

**Status**: 🚀 In Progress  
**Date**: May 9, 2026  
**Goal**: Eliminate legacy thunk actions and fully leverage RTK Query + createSlice

---

## 1. Current State Audit

### Legacy Thunk Actions (to be removed)
```
src/actions/
├── auth.actions.js (registerNewUser, loginUser, getUser, logoutUser, editUser)
├── customer.actions.js (getCustomersList, editCustomer)
├── invoice.actions.js (getInvoicesList, editInvoice, sendInvoiceByEmail)
└── item.actions.js (getItemsList, editItem)
```

### Manual Reducers with Duplicate Loading/Error States (to be refactored)
```
src/reducers/
├── auth.reducer.js (authData, registerUser, loginUser)
├── customer.reducer.js (getCustomers, editCustomer)
├── invoice.reducer.js (getInvoices, editInvoice, sendInvoice)
├── item.reducer.js (getItems, editItem)
├── user.reducer.js (getUser, editUser)
└── index.js (root combineReducers)
```

### Issues with Current Pattern
- ❌ Manual LOADING/SUCCESS/FAIL dispatch for each operation
- ❌ Duplicated loading/error/success state pattern across all reducers
- ❌ Manual thunk orchestration (dispatch(getUser()) after login)
- ❌ Inconsistent error handling
- ❌ No automatic cache invalidation
- ❌ No optimistic updates (except upsertInvoice)
- ❌ Legacy action constants scattered

### RTK Infrastructure Already Present ✅
```
src/store/
├── slices/authSlice.ts (modern createSlice)
├── apis/authApi.ts (modern RTK Query with token refresh)
├── apis/dataApi.ts (modern RTK Query with optimistic updates)
├── hooks.ts (typed hooks)
└── index.ts (RTK store with redux-persist)
```

---

## 2. Migration Map

### Phase 1: Auth Actions → RTK Query

**Current Thunks:**
- `registerNewUser()` → dispatch REGISTER_USER_LOADING/SUCCESS/FAIL
- `loginUser()` → dispatch LOGIN_USER_LOADING/SUCCESS/FAIL
- `getUser()` → dispatch GET_USER_SUCCESS/FAIL
- `logoutUser()` → dispatch USER_LOGGED_OUT_SUCCESS
- `editUser()` → dispatch EDIT_USER_LOADING/SUCCESS/FAIL

**Migration Target:**
- `useRegisterMutation()` ← already in authApi ✅
- `useLoginMutation()` ← already in authApi ✅
- `useGetCurrentUserQuery()` ← already in authApi (rename from getUser) ✅
- `useLogoutUserMutation()` ← already in authApi ✅
- `useUpdateUserMutation()` ← already in authApi (rename from editUser) ✅

**Action Items:**
- ✅ authApi already has all endpoints
- ✅ authSlice handles credentials
- ❌ Remove authReducer loading state (not needed, RTK Query provides it)

### Phase 2: Data Actions → RTK Query

**Current Thunks:**
- `getCustomersList()` → GET_CUSTOMERS_LOADING/SUCCESS/FAIL
- `editCustomer()` → EDIT_CUSTOMER_LOADING/SUCCESS/FAIL
- `getInvoicesList()` → GET_INVOICES_LOADING/SUCCESS/FAIL
- `editInvoice()` → EDIT_INVOICE_LOADING/SUCCESS/FAIL
- `sendInvoiceByEmail()` → SEND_INVOICE_EMAIL_LOADING/SUCCESS/FAIL
- `getItemsList()` → GET_ITEMS_LOADING/SUCCESS/FAIL
- `editItem()` → EDIT_ITEM_LOADING/SUCCESS/FAIL

**Migration Target:**
- `useGetCustomersQuery()` ← already in dataApi ✅
- `useUpsertCustomerMutation()` ← already in dataApi ✅
- `useGetInvoicesQuery()` ← already in dataApi ✅
- `useUpsertInvoiceMutation()` ← already in dataApi ✅
- `useSendInvoiceMutation()` ← already in dataApi ✅
- `useGetItemsQuery()` ← already in dataApi ✅
- `useUpsertItemMutation()` ← already in dataApi ✅

**Action Items:**
- ✅ dataApi already has all endpoints
- ❌ Refactor customer/invoice/item reducers (remove manual loading states)

### Phase 3: Reducer Modernization

**Current Reducers to Convert to createSlice:**
1. `customer.reducer.js` → customerSlice.ts
2. `invoice.reducer.js` → invoiceSlice.ts
3. `item.reducer.js` → itemSlice.ts
4. `user.reducer.js` → userSlice.ts

**New Reducer Pattern:**
```typescript
// OLD: manual switch statements + combineReducers
const getCustomers = (state = {}, action) => {
  switch (action.type) {
    case 'GET_CUSTOMERS_LOADING':
      return { isLoading: true, ... };
    case 'GET_CUSTOMERS_SUCCESS':
      return { customersList: action.payload, ... };
    case 'GET_CUSTOMERS_FAIL':
      return { isError: true, ... };
  }
};

// NEW: RTK Query provides loading/error, reducer only manages UI state
const customerSlice = createSlice({
  name: 'customers',
  initialState: { filterBy: 'name', sortBy: 'created' },
  reducers: {
    setFilterBy(state, action) { state.filterBy = action.payload; },
    setSortBy(state, action) { state.sortBy = action.payload; },
  },
});

// RTK Query hook provides: { data, isLoading, error, isSuccess }
// Reducer only manages: { filterBy, sortBy } (UI state, not API state)
```

---

## 3. Error Handling Refactor

### Current Pattern (Problems)
```javascript
try {
  dispatch({ type: 'LOADING' });
  const response = await fetchApi(...);
  dispatch({ type: 'SUCCESS', payload: response });
} catch (error) {
  dispatch({ type: 'FAIL', payload: error });
  // Developer must manually show toast/alert
}
```

### New Pattern (Centralized)
```typescript
// src/shared/errors/apiErrorHandler.ts
export const handleApiError = (error: unknown) => {
  const message = extractErrorMessage(error);
  showErrorToast(message);
  if (error.status === 401) dispatch(logout());
};

// in any component:
const { error, isLoading } = useGetCustomersQuery();
// Hook automatically handles error display via middleware
```

---

## 4. Selector Improvements

### Current Pattern (Inefficient)
```javascript
const customers = useSelector(state => state.customerReducer.getCustomers.customersList);
const isLoading = useSelector(state => state.customerReducer.getCustomers.isLoading);
const error = useSelector(state => state.customerReducer.getCustomers.isError);
```

### New Pattern (Memoized)
```typescript
// src/store/selectors/customerSelectors.ts
export const selectCustomers = createSelector(
  (state: RootState) => state.customers,
  (customers) => customers // filtered/sorted/transformed
);

export const selectCustomersLoading = (state: RootState) =>
  state.dataApi.queries?.['getCustomers(undefined)']?.status === 'pending';

// in component:
const customers = useSelector(selectCustomers);
```

---

## 5. Codebase Search: Where Thunks Are Used

### Components Using Legacy Thunks (to be updated)
```bash
# Search for dispatch(getCustomersList), dispatch(editInvoice), etc.
grep -r "dispatch(get" src/pages src/components
grep -r "dispatch(edit" src/pages src/components
grep -r "dispatch(login" src/pages src/components
```

### Expected Usage Locations
- src/pages/main/ (home screen - lists customers, invoices, items)
- src/pages/form-pages/ (forms - create/edit)
- src/pages/authentication/ (login/signup/logout)
- src/pages/Profile.tsx (already migrated ✅)

---

## 6. Migration Execution Plan

### Step 1: Identify All Thunk Usages
```bash
find src -type f \( -name "*.js" -o -name "*.tsx" \) \
  -exec grep -l "getCustomersList\|getInvoicesList\|getItemsList\|editInvoice\|editCustomer\|editItem\|loginUser\|registerNewUser\|getUser\|logoutUser\|editUser" {} \;
```

### Step 2: Refactor Each Page/Component

**Priority Order:**
1. **Authentication Pages** (Login.tsx, SignUp.tsx, Profile.tsx)
   - Already using RTK Query ✅ (Login.tsx, SignUp.tsx, Profile.tsx)
   - No changes needed

2. **Main Pages** (home screen showing lists)
   - Currently using thunks
   - Migrate to useGetCustomersQuery, useGetInvoicesQuery, useGetItemsQuery

3. **Form Pages** (CustomerForm, ItemForm, InvoiceForm)
   - Currently using thunks
   - Migrate to useUpsertCustomerMutation, useUpsertItemMutation, useUpsertInvoiceMutation
   - Already migrated InvoiceForm.tsx ✅

### Step 3: Convert Reducers to createSlice
```typescript
// Before: customer.reducer.js with switch statements
// After: customerSlice.ts with createSlice

const customerSlice = createSlice({
  name: 'customer',
  initialState: { sortBy: 'name' },
  reducers: {
    setSortBy(state, action) { state.sortBy = action.payload; }
  }
});

export const { setSortBy } = customerSlice.actions;
export default customerSlice.reducer;
```

### Step 4: Create Error Handling Middleware
```typescript
// src/store/middleware/errorHandler.ts
export const errorHandlerMiddleware = (storeApi: MiddlewareAPI) =>
  (next: Dispatch) => (action: any) => {
    if (action.type?.endsWith('/rejected')) {
      const error = action.payload?.message ?? 'Unknown error';
      showErrorToast(error);
    }
    return next(action);
  };
```

### Step 5: Create Memoized Selectors
```typescript
// src/store/selectors/index.ts
export const selectCustomers = (state: RootState) =>
  state.dataApi.queries['getCustomers(undefined)']?.data ?? [];

export const selectCustomersLoading = (state: RootState) =>
  state.dataApi.queries['getCustomers(undefined)']?.status === 'pending';
```

### Step 6: Remove Legacy Code
- Delete src/actions/ directory
- Delete src/reducers/auth.reducer.js, customer.reducer.js, invoice.reducer.js, item.reducer.js
- Update src/reducers/index.js to use new slices

---

## 7. Backward Compatibility

**API Contracts Preserved:**
- ✅ All backend endpoints unchanged
- ✅ Request/response formats unchanged
- ✅ Auth token refresh mechanism maintained
- ✅ Error response formats handled by RTK Query transformResponse

**Bundle Size Impact:**
- Remove redux-form: ~50KB ✅ (already done)
- Remove thunk-based actions: ~10KB
- Add RTK Query tags/caching logic: +5KB
- **Net improvement: ~55KB**

---

## 8. Files to Create/Modify

### New Files
```
src/shared/errors/apiErrorHandler.ts
src/shared/errors/errorTypes.ts
src/store/middleware/errorHandler.ts
src/store/slices/customerSlice.ts
src/store/slices/invoiceSlice.ts
src/store/slices/itemSlice.ts
src/store/slices/userSlice.ts
src/store/selectors/index.ts
src/store/selectors/customerSelectors.ts
src/store/selectors/invoiceSelectors.ts
src/store/selectors/itemSelectors.ts
```

### Modified Files
```
src/store/apis/dataApi.ts (add tags and cache invalidation)
src/store/index.ts (register middleware, add selectors)
src/reducers/index.js (use new slices instead of old reducers)
src/pages/**/*.tsx (replace dispatch(thunk) with hooks)
```

### Deleted Files
```
src/actions/ (entire directory)
src/reducers/auth.reducer.js (replace with authSlice)
src/reducers/customer.reducer.js (replace with customerSlice)
src/reducers/invoice.reducer.js (replace with invoiceSlice)
src/reducers/item.reducer.js (replace with itemSlice)
src/reducers/user.reducer.js (replace with userSlice)
```

---

## 9. Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Thunk actions | 17 | 0 | ✅ 0 |
| Manual loading reducers | 8 | 0 | ✅ 0 |
| createSlice reducers | 1 | 5+ | ✅ 5+ |
| RTK Query endpoints | 13 | 13+ | ✅ 13+ |
| Code lines removed | — | ~500 | ✅ ~500 |
| Bundle size reduction | — | ~10KB | ✅ ~10KB |
| Cache invalidation | Manual | Automatic | ✅ Auto |
| Error handling | Scattered | Centralized | ✅ Centralized |

---

## 10. Rollback Plan

If issues arise:
1. Keep legacy action files in a `_deprecated/` folder temporarily
2. Commit each phase separately so partial rollback is possible
3. Test each page independently before full deployment
4. Run full test suite before removing legacy files

---

## 11. Timeline

- **Phase 1 (Hour 1)**: Audit ✅ → Planning → Create error handling
- **Phase 2 (Hour 2)**: Refactor reducers to createSlice
- **Phase 3 (Hour 3)**: Update pages to use RTK Query hooks
- **Phase 4 (Hour 4)**: Create selectors and improve caching
- **Phase 5 (Hour 5)**: Delete legacy files and cleanup
- **Phase 6 (Hour 6)**: Testing and final report

---

**Next Step**: Start Phase 1 execution → Create error handling infrastructure

