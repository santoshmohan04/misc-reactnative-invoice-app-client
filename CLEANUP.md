# Cleanup Guide: Orphan Root Artifacts

## Problem

During the initial modernization work, some Next.js files were created at the root level instead of in `web-app/`:

```
Root Level (INCORRECT - These shouldn't be here)
├── apiSlice.ts              ❌ Should be: web-app/src/store/apiSlice.ts
├── middleware.ts            ❌ Should be: web-app/src/middleware.ts
├── DashboardLayout.tsx      ❌ Should be: web-app/src/components/DashboardLayout.tsx
└── app-context-mobile.md    ✅ Keep (reference documentation)
```

## Cleanup Steps

### 1. Remove Orphan Files

These files should be **deleted** because:
- They are duplicates of files now in `web-app/`
- They are not used by any build system
- They clutter the root directory

**Files to Delete**:
```bash
# Command to remove (use your file explorer or terminal)
rm -f apiSlice.ts
rm -f middleware.ts
rm -f DashboardLayout.tsx
```

### 2. Keep Reference Documentation

**Keep These**:
- `app-context-mobile.md` — Reference for mobile app context
- `FRONTEND_CONTEXT.md` — Overall frontend architecture notes
- `README.md` — Root project documentation
- `MIGRATION.md` — Phase migration guide (just created)
- `ARCHITECTURE.md` — Architecture documentation (just created)

## Current State

### Active Files (in web-app/)
✅ [web-app/src/store/apiSlice.ts](web-app/src/store/apiSlice.ts) — RTK Query definitions  
✅ [web-app/src/middleware.ts](web-app/src/middleware.ts) — Auth middleware  
✅ [web-app/src/components/DashboardLayout.tsx](web-app/src/components/DashboardLayout.tsx) — (if exists)

### Orphan Files (at root)
❌ `apiSlice.ts` — DELETE
❌ `middleware.ts` — DELETE
❌ `DashboardLayout.tsx` — DELETE

## Verification Checklist

After cleanup, verify:

- [ ] Root directory no longer contains `.ts`/`.tsx` files (except config files)
- [ ] Web app still builds: `cd web-app && npm run build`
- [ ] Mobile app still builds: `npm run build:mobile`
- [ ] All imports in web-app resolve correctly
- [ ] No git conflicts or missing files

## Impact

**None**: These orphan files are not imported by any build system and serve no purpose.

**After Cleanup**:
- ✅ Root directory is cleaner
- ✅ No confusion about which version is active
- ✅ Faster IDE indexing
- ✅ Better git hygiene

---

**Recommendation**: Delete these orphan files now and commit with message:
```
cleanup: remove orphan Next.js artifacts from root

- Removed apiSlice.ts (duplicate of web-app/src/store/apiSlice.ts)
- Removed middleware.ts (duplicate of web-app/src/middleware.ts)  
- Removed DashboardLayout.tsx (not used)

These files were created during early exploration and are not part of
the active build system. The canonical versions live in web-app/src/.
```
