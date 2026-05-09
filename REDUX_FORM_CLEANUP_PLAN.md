# Redux-Form Cleanup Plan

**Status**: In Progress  
**Date**: May 9, 2026

## Current Redux-Form Usage

### Forms Still Using redux-form:
1. ❌ `src/pages/authentication/Login.js` (legacy - has TypeScript replacement)
2. ❌ `src/pages/authentication/SignUp.js` (legacy - has TypeScript replacement)
3. ❌ `src/pages/form-pages/InvoiceForm.js` (legacy - has TypeScript replacement)
4. ❌ `src/pages/Profile.js` (last form to migrate)

### Redux-Form Components/Utilities:
- `src/components/reduxFormRenderers/` (4 files)
  - RenderTextInput.js
  - RenderDatePicker.js
  - RenderSelectOption.js
  - RenderItemsInputArray.js
- `src/utils/redux.form.utils.js` (validators)
- `src/reducers/index.js` (formReducer)

## Migration Tasks

### Phase 1: Migrate Remaining Forms ✅
- [ ] Migrate `Profile.js` to TypeScript + react-hook-form
- [ ] Create profile schema (Zod)
- [ ] Create form field components
- [ ] Update store with `useUpdateUserMutation`

### Phase 2: Create New Form Architecture ✅
- [ ] `src/shared/forms/fields/TextInputField.tsx`
- [ ] `src/shared/forms/fields/SelectField.tsx`
- [ ] `src/shared/forms/fields/DateField.tsx`
- [ ] `src/shared/forms/fields/CurrencyField.tsx`
- [ ] `src/shared/forms/hooks/useZodForm.ts`
- [ ] `src/shared/forms/components/FormErrorText.tsx`
- [ ] `src/shared/validation/` (schemas)

### Phase 3: Remove Redux-Form
- [ ] Delete `src/components/reduxFormRenderers/`
- [ ] Delete/refactor `src/utils/redux.form.utils.js`
- [ ] Remove `formReducer` from `src/reducers/index.js`
- [ ] Update `src/config/store.js` (remove form persistence)

### Phase 4: Cleanup
- [ ] Delete `src/pages/authentication/Login.js` (legacy)
- [ ] Delete `src/pages/authentication/SignUp.js` (legacy)
- [ ] Delete `src/pages/form-pages/InvoiceForm.js` (legacy)
- [ ] Remove redux-form from `package.json`
- [ ] Update imports in all files

## Success Criteria

✅ All forms functional with react-hook-form
✅ No redux-form imports remaining
✅ No compile errors
✅ All validation working
✅ Form state isolated (no global form Redux)

## Files to Create

```
src/shared/forms/
  ├── fields/
  │   ├── TextInputField.tsx
  │   ├── SelectField.tsx
  │   ├── DateField.tsx
  │   └── CurrencyField.tsx
  ├── hooks/
  │   └── useZodForm.ts
  ├── components/
  │   ├── FormErrorText.tsx
  │   ├── FormFieldWrapper.tsx
  │   └── FormContainer.tsx
  └── index.ts

src/shared/validation/
  ├── schemas.ts
  ├── validators.ts
  └── index.ts

src/pages/Profile.tsx (NEW)
```

## Files to Delete

```
src/components/reduxFormRenderers/
  ├── RenderTextInput.js
  ├── RenderDatePicker.js
  ├── RenderSelectOption.js
  └── RenderItemsInputArray.js

src/pages/authentication/Login.js
src/pages/authentication/SignUp.js
src/pages/form-pages/InvoiceForm.js
```

## Incremental Safety

1. New forms use react-hook-form in parallel
2. Legacy forms remain until all migrated
3. RTK Query mutations used instead of thunks
4. Form state is local, not global
5. No breaking changes to existing APIs
