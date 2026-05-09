# TypeScript Strict Migration: Developer Quick Reference

**Last Updated**: May 9, 2026  
**Mode**: Strict TypeScript enabled (`strict: true`)

---

## 🚀 Quick Start for File Conversions

### Step 1: Create the TypeScript File
Convert from `.js` to `.ts` (or `.tsx` for React components)

### Step 2: Add Type Annotations

#### Utility Functions
```typescript
// ❌ Before
export const formatAmount = (amount) => {
  return amount.toFixed(2);
};

// ✅ After
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};
```

#### React Components
```typescript
// ❌ Before
function MyComponent(props) {
  return <View>{props.title}</View>;
}

// ✅ After
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return <View onPress={onPress}>{title}</View>;
};

export default MyComponent;
```

#### Classes
```typescript
// ❌ Before
class ErrorHandler {
  constructor(error) {
    this.message = error.message;
  }
}

// ✅ After
class ErrorHandler {
  readonly message: string;

  constructor(error: Error | ApiErrorWithStatus) {
    this.message = error.message || 'Unknown error';
  }
}
```

### Step 3: Import Types
```typescript
// Domain types
import type { Invoice, Customer, User } from '@types';

// Utility types
import type { Nullable, AsyncResult, FormState } from '@types';

// Type guards
import { isApiError, isNullable } from '@types';
```

### Step 4: Test Compilation
```bash
# Check for type errors
tsc --noEmit

# Expected output:
# ✅ No errors
```

---

## 📋 Type Reference by Category

### Domain Types
```typescript
User {
  _id?: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  base_currency?: string;
}

Invoice {
  _id?: string;
  number: string;
  customer_id?: string;
  issued: string | number;
  due: string | number;
  items?: InvoiceItem[];
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
}

Customer {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

Item {
  _id?: string;
  name: string;
  price?: number;
  description?: string;
}
```

### Utility Types
```typescript
// Nullable value
type Optional<User> = User | null;

// Make all props optional
type PartialUser = DeepPartial<User>;

// Async result wrapper
type Result<Invoice> = AsyncResult<Invoice, Error>;

// Form error structure
type FormErrors = Record<keyof Invoice, FieldError>;
```

### Type Guards
```typescript
import { isApiError, isNullable, isError } from '@types';

if (isApiError(error)) {
  console.log(error.status); // ✅ Type narrowed
}

if (isNullable(value)) {
  return value; // ✅ Type narrowed to non-null
}
```

---

## 🔄 React Hook Patterns

### RTK Query Hooks (Use Everywhere!)
```typescript
import { useGetInvoicesQuery, useUpsertInvoiceMutation } from '@store/apis/dataApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

// ✅ Type-safe query
const { data: invoices, isLoading, error } = useGetInvoicesQuery();

// ✅ Type-safe mutation
const [upsertInvoice, { isLoading: saving }] = useUpsertInvoiceMutation();

const onSubmit = async (values: Invoice) => {
  try {
    await upsertInvoice(values).unwrap();
  } catch (err) {
    // Error is properly typed
  }
};
```

### Typed Redux Selectors
```typescript
import { useAppSelector } from '@store/hooks';
import { selectFilteredInvoices, selectInvoiceById } from '@store/selectors/invoiceSelectors';

// ✅ Properly typed return values
const filtered = useAppSelector(selectFilteredInvoices);
const invoice = useAppSelector((state) => selectInvoiceById(state, invoiceId));
```

### React Hook Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema } from '@shared/validation';

const MyForm: React.FC = () => {
  const { control, handleSubmit } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { ... }
  });

  return ...;
};
```

---

## 🛠️ Common Conversions

### Convert Function with Union Return
```typescript
// Before
export const getValue = (obj) => {
  return obj.value || obj.defaultValue || null;
};

// After
export const getValue = (obj: { value?: string; defaultValue?: string }): string | null => {
  return obj.value || obj.defaultValue || null;
};

// Even better
export const getValue = (obj: { value?: string; defaultValue?: string }): Nullable<string> => {
  return obj.value ?? obj.defaultValue ?? null;
};
```

### Convert Component with Children
```typescript
// Before
const Container = ({ children, title }) => (
  <View>
    <Text>{title}</Text>
    {children}
  </View>
);

// After
interface ContainerProps {
  title: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ title, children }) => (
  <View>
    <Text>{title}</Text>
    {children}
  </View>
);
```

### Convert Async Function
```typescript
// Before
export const fetchInvoices = async (customerId) => {
  const response = await api.get(`/invoices?customer=${customerId}`);
  return response.data;
};

// After
export const fetchInvoices = async (customerId: string): Promise<Invoice[]> => {
  const response = await api.get<GetInvoicesResponse>(`/invoices?customer=${customerId}`);
  return response.data.invoices;
};
```

---

## ✅ Checklist Before Commit

- [ ] File renamed from `.js` to `.ts` or `.tsx`
- [ ] All function parameters have types
- [ ] All function return types specified
- [ ] All React components have props interface
- [ ] All `any` types removed (check with grep)
- [ ] Imports updated to use new file path
- [ ] `tsc --noEmit` passes with zero errors
- [ ] No `// @ts-ignore` comments added
- [ ] JSDoc comments updated if needed
- [ ] Related `.d.ts` declarations updated if created

---

## 🎯 Priority Conversion Order

### Phase 1a: Utilities (Do These First)
1. `src/utils/currencies.utils.ts` - Add Currency interface
2. `src/service/api.ts` - Add API service types
3. `src/utils/redux.form.utils.ts` - DELETE (no longer used)
4. `src/config/store.js` - DELETE (modern RTK store.ts exists)

### Phase 1b: Components (Base Components Used Everywhere)
1. `src/components/NavBar.tsx` - Navigation component
2. `src/components/InnerPageHeader.tsx` - Form header
3. `src/components/ListView.tsx` - List container
4. `src/components/EmptyListPlaceHolder.tsx` - Empty state

### Phase 2: Pages (User-Facing Screens)
1. `src/pages/main/Invoices.tsx`
2. `src/pages/main/Customers.tsx`
3. `src/pages/main/Items.tsx`
4. `src/pages/form-pages/CustomerForm.tsx`
5. `src/pages/form-pages/ItemForm.tsx`

### Phase 3: Cleanup
1. Delete old `.js` versions when `.tsx` confirmed working
2. Update `src/pages/index.js` → `src/pages/index.ts`
3. Delete legacy Redux files (actions, reducers)

---

## 🐛 Common TypeScript Errors & Fixes

### Error: Type 'unknown' is not assignable to type 'string'
```typescript
// ❌ Wrong
const error: unknown = new Error('test');
const message: string = error.message; // ❌ Error!

// ✅ Fix
if (error instanceof Error) {
  const message: string = error.message; // ✅ OK
}

// Or use type guard
if (isError(error)) {
  const message: string = error.message; // ✅ OK
}
```

### Error: Property does not exist on type
```typescript
// ❌ Wrong
const user: User = data;
const username = user.username; // ❌ Property 'username' does not exist

// ✅ Fix
const username = user.name; // ✅ Check User interface

// Or use optional chaining
const username = (user as any).username; // ✅ Last resort (avoid!)
```

### Error: Argument of type 'unknown' is not assignable
```typescript
// ❌ Wrong
const handleError = (error: unknown) => {
  console.log(error.message); // ❌ Object is of type 'unknown'
};

// ✅ Fix 1: Type narrowing
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message);
  }
};

// ✅ Fix 2: Type assertion (careful!)
const handleError = (error: unknown) => {
  console.log((error as Error).message);
};

// ✅ Fix 3: Use our type guard
const handleError = (error: unknown) => {
  if (isError(error)) {
    console.log(error.message);
  }
};
```

---

## 📚 Resources

- **Types Module**: `src/types/index.ts` - All domain and utility types
- **Migration Guide**: `TYPESCRIPT_STRICT_MIGRATION_REPORT.md` - Comprehensive strategy
- **Patterns**: `TYPESCRIPT_PHASE1_COMPLETION_SUMMARY.md` - Conversion patterns
- **TSConfig**: `tsconfig.json` - All compiler options
- **Type Guards**: Use `isError()`, `isApiError()`, `isNullable()` from `@types`

---

## 🚀 Running TypeScript Checks

```bash
# Check all files for type errors
tsc --noEmit

# Check specific file
tsc --noEmit src/components/MyComponent.tsx

# Generate declaration files (if needed)
tsc --declaration --emitDeclarationOnly

# Watch mode (auto-recheck on save)
tsc --watch --noEmit
```

---

## 💡 Pro Tips

1. **Use the types barrel export** - Import from `@types` instead of typing locally
2. **Leverage type inference** - TypeScript can often infer types, you don't need to specify all
3. **Use discriminated unions** - Status fields like `'draft' | 'sent' | 'paid'`
4. **Keep interfaces small** - Easier to understand and maintain
5. **Document complex types** - Use JSDoc comments for interfaces
6. **Don't use `any`** - Use `unknown` and type narrow instead
7. **Test at compile-time** - `tsc --noEmit` catches errors before runtime

---

**Status**: Strict TypeScript enabled & enforced  
**Coverage**: 85%+ of codebase (increasing)  
**Next**: Continue systematic file conversion using patterns above

