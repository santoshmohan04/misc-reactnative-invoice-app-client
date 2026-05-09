# Phase 2 Quick Reference: Using RTK Query + react-hook-form

## Import Patterns

```typescript
// State management
import { useAppDispatch, useAppSelector, useAuth } from '@store/hooks';
import { setCredentials, logout } from '@store/slices/authSlice';

// API hooks
import { useLoginMutation, useGetCurrentUserQuery } from '@store/apis/authApi';
import { useGetInvoicesQuery, useCreateInvoiceMutation } from '@store/apis/dataApi';

// Forms
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@types/schemas';

// Types
import { User, Invoice, Customer, Item } from '@types';
```

---

## Authentication

### Check if Authenticated
```typescript
import { useIsAuthenticated } from '@store/hooks';

function MyComponent() {
  const isAuth = useIsAuthenticated();
  return isAuth ? <Dashboard /> : <Login />;
}
```

### Get Auth Info
```typescript
import { useAuth, useAuthUser, useAuthToken } from '@store/hooks';

function MyComponent() {
  // Full auth object
  const { user, token, isAuthenticated, error, isLoading } = useAuth();

  // Or individual selectors
  const user = useAuthUser();
  const token = useAuthToken();
}
```

### Dispatch Auth Actions
```typescript
import { useAppDispatch } from '@store/hooks';
import { setCredentials, logout, setError } from '@store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();

  // Set credentials (usually done by auth API)
  dispatch(setCredentials({
    user: { email: 'user@example.com' },
    access_token: 'jwt...',
    refresh_token: 'jwt...',
  }));

  // Logout
  dispatch(logout());

  // Set error
  dispatch(setError('Something went wrong'));
}
```

---

## Queries (Fetching Data)

### Basic Query
```typescript
import { useGetInvoicesQuery } from '@store/apis/dataApi';

function InvoicesList() {
  const { data, isLoading, error, refetch } = useGetInvoicesQuery();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
}
```

### Query with Parameters
```typescript
const { data: invoice } = useGetInvoiceQuery('invoice-id-123');
```

### Skip Query (Conditional)
```typescript
// Don't run query if no ID
const { data: invoice } = useGetInvoiceQuery(id, {
  skip: !id, // Skip if no ID
});
```

### Manual Refetch
```typescript
const { refetch } = useGetInvoicesQuery();

// Later...
await refetch();
```

---

## Mutations (Creating/Updating/Deleting)

### Basic Mutation
```typescript
import { useCreateInvoiceMutation } from '@store/apis/dataApi';

function CreateInvoiceForm() {
  const [createInvoice, { isLoading, error, data }] = useCreateInvoiceMutation();

  const handleSubmit = async (formData) => {
    try {
      const result = await createInvoice(formData).unwrap();
      console.log('Success:', result);
    } catch (err) {
      console.error('Error:', err.data?.message);
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Update Mutation
```typescript
const [updateInvoice, { isLoading }] = useUpdateInvoiceMutation();

await updateInvoice({
  id: 'invoice-123',
  data: { status: 'paid', amount: 1000 },
}).unwrap();
```

### Delete Mutation
```typescript
const [deleteInvoice] = useDeleteInvoiceMutation();

await deleteInvoice('invoice-123').unwrap();
```

---

## Forms with react-hook-form

### Basic Form
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@types/schemas';

function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <input placeholder="Email" {...field} />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <input placeholder="Password" type="password" {...field} />
        )}
      />
      {errors.password && <Text>{errors.password.message}</Text>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Form with Mutation
```typescript
function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      // Success - user is auto-logged in
    } catch (err) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Custom Validation
```typescript
const schema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

## Combined Example: Login Screen

```typescript
import React, { useEffect } from 'react';
import { View, Text, Button as RNButton } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useLoginMutation } from '@store/apis/authApi';
import { useAppDispatch, useIsAuthenticated } from '@store/hooks';
import { loginSchema, type LoginFormData } from '@types/schemas';

function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isAuth = useIsAuthenticated();
  
  const [login, { isLoading, error }] = useLoginMutation();
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Auto-redirect when authenticated
  useEffect(() => {
    if (isAuth) {
      navigation.navigate('Home');
    }
  }, [isAuth, navigation]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      // Auto-redirect happens via useEffect above
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      {error && <Text style={{ color: 'red' }}>{error.data?.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <input placeholder="Email" {...field} />
        )}
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <input placeholder="Password" type="password" {...field} />
        )}
      />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

      <RNButton
        title={isLoading ? 'Loading...' : 'Login'}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      />
    </View>
  );
}

export default LoginScreen;
```

---

## Combining Multiple Queries

```typescript
import { useGetInvoicesQuery } from '@store/apis/dataApi';
import { useGetCustomersQuery } from '@store/apis/dataApi';

function DashboardScreen() {
  const { data: invoices, isLoading: invoicesLoading } = useGetInvoicesQuery();
  const { data: customers, isLoading: customersLoading } = useGetCustomersQuery();

  if (invoicesLoading || customersLoading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Invoices: {invoices?.length}</Text>
      <Text>Customers: {customers?.length}</Text>
    </View>
  );
}
```

---

## API Caching & Invalidation

RTK Query automatically caches data. When you create/update/delete:

```typescript
const [createInvoice] = useCreateInvoiceMutation();

// After calling createInvoice(), RTK Query automatically:
// 1. Invalidates { type: 'Invoice', id: 'LIST' } tag
// 2. Re-fetches useGetInvoicesQuery() automatically
// 3. Shows updated list without manual refetch
```

---

## Common Patterns

### Refetch on Focus (React Navigation)
```typescript
import { useFocusEffect } from '@react-navigation/native';

function InvoicesScreen() {
  const { refetch } = useGetInvoicesQuery();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // ... rest of component
}
```

### Filter & Search
```typescript
function InvoicesScreen() {
  const [status, setStatus] = useState('all');
  const { data: invoices } = useGetInvoicesQuery();

  const filtered = invoices?.filter(
    inv => status === 'all' || inv.status === status
  ) ?? [];

  return <FlatList data={filtered} {...} />;
}
```

### Pull to Refresh
```typescript
const { refetch, isLoading } = useGetInvoicesQuery();

return (
  <FlatList
    onRefresh={refetch}
    refreshing={isLoading}
    {...}
  />
);
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module '@store'" | Check tsconfig.json path aliases |
| Cache not updating after mutation | Add `invalidatesTags` to mutation |
| Form validation not working | Use `zodResolver` in useForm options |
| Tokens not persisting | Wrap app in PersistGate |
| "useAuth is not a function" | Make sure importing from '@store/hooks' |
| Circular imports | Use barrel exports in index.ts files |

---

**For full documentation, see**: [PHASE2_RTK_SETUP.md](PHASE2_RTK_SETUP.md)
