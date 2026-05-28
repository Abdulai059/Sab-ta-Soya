# Troubleshooting Guide

## Build Cache Issues

If you encounter module resolution errors after moving files, follow these steps:

### 1. Clear Next.js Build Cache
```bash
rm -rf .next
```

### 2. Clear Node Modules (if needed)
```bash
rm -rf node_modules
npm install
# or
yarn install
```

### 3. Clear Turbopack Cache (if using Turbopack)
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### 4. Restart Development Server
```bash
npm run dev
# or
yarn dev
```

## Common Issues After File Reorganization

### Issue: "Module not found" errors
**Cause:** Build cache contains stale import references

**Solution:**
1. Stop the development server (Ctrl+C)
2. Delete `.next` folder: `rm -rf .next`
3. Restart the development server: `npm run dev`

### Issue: Components not rendering
**Cause:** Dynamic imports not resolving correctly

**Solution:**
1. Verify file exists at new location
2. Check import path in DashboardShell.js
3. Clear cache and rebuild

### Issue: Navigation not working
**Cause:** View components not registered in VIEW_COMPONENTS

**Solution:**
Check `components/ui/DashboardShell.js` and ensure:
1. Component is imported with `lazy()`
2. Component is added to `VIEW_COMPONENTS` object
3. View name matches sidebar navigation

## Verification Steps

### 1. Check File Structure
```bash
# Verify all pages are in dashboard folder
ls -la app/(dashboard)/
```

Expected structure:
```
app/(dashboard)/
├── admin/
├── maps/              ✓
├── my-assignments/    ✓
├── reports/           ✓
│   └── [id]/         ✓
├── reporteissue/      ✓
└── layout.js
```

### 2. Check Import Paths
All imports in `DashboardShell.js` should use `@/app/(dashboard)/`:
```javascript
const ReportsPage = lazy(() => import("@/app/(dashboard)/reports/page"));
const ReportDetail = lazy(() => import("@/app/(dashboard)/reports/[id]/page"));
const MyAssignmentsPage = lazy(() => import("@/app/(dashboard)/my-assignments/page"));
```

### 3. Test Navigation
1. Login to dashboard
2. Click each sidebar item
3. Verify view loads without errors
4. Check browser console for errors

## Development Server Issues

### Issue: Server won't start
**Solution:**
```bash
# Kill any running processes
pkill -f "next dev"

# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Issue: Hot reload not working
**Solution:**
1. Check if `.next` folder is too large
2. Clear cache: `rm -rf .next`
3. Restart server

## Build Issues

### Issue: Production build fails
**Solution:**
```bash
# Clear everything
rm -rf .next
rm -rf node_modules

# Reinstall
npm install

# Try build
npm run build
```

### Issue: Turbopack errors
**Solution:**
```bash
# Use webpack instead
npm run dev -- --no-turbo

# Or update next.config.js to disable turbopack
```

## Quick Fixes

### Reset Everything
```bash
# Nuclear option - clears all caches
rm -rf .next
rm -rf node_modules
rm -rf node_modules/.cache
npm install
npm run dev
```

### Verify Imports
```bash
# Search for old import paths
grep -r "@/app/reports/\[id\]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# Should return no results
```

### Check File Permissions
```bash
# Ensure files are readable
chmod -R 755 app/(dashboard)
```

## Getting Help

If issues persist:
1. Check Next.js version: `npm list next`
2. Check Node version: `node --version`
3. Review error logs in terminal
4. Check browser console for client-side errors
5. Review `DASHBOARD-CONTAINMENT.md` for implementation details
