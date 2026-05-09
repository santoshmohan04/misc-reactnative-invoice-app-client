# Phase 2: InvoiceForm Modernization

**Status**: ✅ Complete

**Date**: May 9, 2026

## Summary

The legacy `InvoiceForm.js` (class component + redux-form + thunks) has been fully modernized to use:
- **React Hooks** with TypeScript
- **react-hook-form** + Zod validation
- **RTK Query** mutations with optimistic updates
- **useFieldArray** for dynamic item rows
- **Draft autosave** to AsyncStorage
- **Dirty-state navigation guard**
- **Performance optimizations** via memoization and useCallback/useMemo

### Key Features Implemented

✅ **Functional Component (TypeScript)**
- `src/pages/form-pages/InvoiceForm.tsx` - main form component
- Full TypeScript typing with Zod runtime validation
- Zero class components, pure hooks-based architecture

✅ **Typed Validation Schema**
- `src/types/schemas/invoice.schema.ts` - Zod schema with InvoiceItem and Invoice types
- Validates: customer, number, issued/due dates, items, subtotal, discount, total
- Runtime validation with helpful error messages

✅ **Pure Calculation Utilities**
- `src/features/invoices/utils/calculations.ts` - reusable, unit-testable functions
- `calculateSubtotal()` - sum of (qty × price) for all items
- `calculateDiscount()` - sum of (qty × price × discountPct / 100) per item
- `calculateTax()` - simple tax rate calculation
- `calculateGrandTotal()` - returns { subtotal, discount, tax, total }

✅ **Reusable Item Row Component**
- `src/features/invoices/components/InvoiceItemRow.tsx` - memoized sub-component
- Individual field controls: description, quantity, price, discount
- Isolated rendering to avoid unnecessary re-renders
- Uses react-hook-form Controller for integration with parent form

✅ **RTK Query Integration**
- Uses `useUpsertInvoiceMutation` from dataApi
- Optimistic cache updates via `onQueryStarted` + `updateQueryData`
- Automatic rollback on failure
- Tag-based invalidation for fresh data

✅ **Draft Autosave**
- Debounced (800ms) AsyncStorage persistence of form state
- Automatic restore on component mount
- Cleared on successful submit
- Key: `invoice_draft:{id}` (or `invoice_draft:new` for new invoices)

✅ **Dirty State Protection**
- Detects unsaved changes via `formState.isDirty`
- Shows confirmation dialog before navigation away
- Prevents accidental loss of data

✅ **Performance Optimizations**
- `React.memo()` on InvoiceItemRow
- `useCallback()` for submit handler
- `useMemo()` for calculations
- Debounced autosave to avoid excessive writes
- Isolated field controls reduce render cascades

✅ **Improved UX**
- Inline error display via Zod validation
- Loading states via RTK Query `isLoading`
- Success/error alerts after submit
- Totals computed and displayed in real-time
- Add/Remove item buttons with clear affordance
- Proper date formatting (YYYY-MM-DD)

✅ **Unit Tests**
- `__tests__/calculations.test.ts` - tests all calculation functions
- `__tests__/schema.test.ts` - validates Zod schema behavior
- Tests cover edge cases and validation rules

## File Changes

### New Files Created
```
src/types/schemas/invoice.schema.ts
src/features/invoices/utils/calculations.ts
src/features/invoices/components/InvoiceItemRow.tsx
src/pages/form-pages/InvoiceForm.tsx         [replaces legacy .js]
__tests__/calculations.test.ts
__tests__/schema.test.ts
```

### Updated Files
```
tsconfig.json                                 [@features/* path alias added]
src/store/apis/dataApi.ts                     [optimistic update logic added]
src/pages/index.js                            [import InvoiceForm.tsx instead]
```

### Files NOT Modified (remain for backward compat)
```
src/pages/form-pages/InvoiceForm.js           [legacy - can be removed when ready]
src/actions/invoice.actions.js                [legacy thunks - can be removed]
src/reducers/invoice.reducer.js               [legacy - can be removed]
```

## API Contract Preservation

The new implementation preserves the existing backend API contract:

**Request Payload** (POST `/invoice/edit`):
```javascript
{
  _id: string (optional, for update),
  number: string,
  customer: string | object,
  issued: string (ISO date),
  due: string (ISO date),
  items: [
    { quantity: number, price: number, discount: number, ... }
  ],
  subtotal: number,
  discount: number,
  total: number,
  notes: string (optional)
}
```

**Response**: Success returns invoice object, handled by RTK Query transform.

## Usage Example

```typescript
import InvoiceForm from '@pages/form-pages/InvoiceForm.tsx';

// In navigation or route:
<Stack.Screen name="invoiceForm" component={InvoiceForm} />

// Passing existing invoice:
navigation.navigate('invoiceForm', { invoice: existingInvoiceData });

// Creating new invoice:
navigation.navigate('invoiceForm');
```

## Testing

Run tests:
```bash
npm test -- __tests__/calculations.test.ts
npm test -- __tests__/schema.test.ts
```

Run the app:
```bash
npx expo start
```

Navigate to invoices list → click invoice → form opens with full RTK Query, autosave, and draft recovery.

## Migration Status

- ✅ InvoiceForm fully modernized
- ✅ Removed all redux-form usage from this component
- ✅ Removed all thunk dispatch calls from this component
- ⏳ Profile.js migration pending
- ⏳ Cleanup of legacy thunks/actions/reducers (deferred until all screens migrated)

## Notes

1. **Backward Compatibility**: The form accepts both new (RTK-based) and legacy (thunk-based) data structures, ensuring no API breakage.

2. **Date Handling**: Dates are stored as strings in ISO format (YYYY-MM-DD) in the form to simplify React Native input handling. Backend accepts ISO format.

3. **Customer/Item Selection**: The form currently accepts free-text input for customer and items. A future enhancement could add a dropdown selector using the fetched `useGetCustomersQuery()` and `useGetItemsQuery()` data.

4. **Optimistic Updates**: Cache invalidation is still provided as a fallback; optimistic updates are attempted but RTK Query will handle the source of truth.

5. **Draft Persistence**: Drafts are cleared on successful submit and can be manually cleared by the user if needed.

## Next Steps

1. Migrate `src/pages/Profile.js` (similar pattern)
2. Remove legacy files once all forms are converted
3. Run E2E tests on the full flow (login → create invoice → send)
4. Verify backend API responses align with schemas
