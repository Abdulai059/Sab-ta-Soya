# Role-Based Access Control (RBAC) System

This document describes the production-ready RBAC system implemented in SaniTrack.

## Overview

The RBAC system follows senior engineering best practices with:
- **Centralized permission definitions** - Single source of truth for all permissions
- **Permission-based access** - Not role-based, but permission-based for flexibility
- **Clean separation of concerns** - Roles map to permissions, not directly to features
- **Reusable hooks and components** - Easy to use throughout the application
- **Backward compatibility** - Existing role-based checks still work

## Architecture

### File Structure

```
lib/
  permissions.js          # Centralized permission definitions and role mappings

hooks/
  usePermissions.js       # React hooks for permission checks

components/ui/
  RequirePermission.js     # Permission-based wrapper components
  ProtectedRoute.js       # Enhanced route protection with permissions
```

## Core Concepts

### Permissions vs Roles

- **Roles**: User identity (admin, district_officer, etc.)
- **Permissions**: Capabilities (reports:view_all, users:change_roles, etc.)
- **Mapping**: Each role has a set of permissions defined in `lib/permissions.js`

### Permission Categories

```javascript
// Dashboard & Navigation
DASHBOARD.VIEW_ADMIN_PANEL
DASHBOARD.VIEW_DISTRICT_PANEL
DASHBOARD.VIEW_NGO_PORTAL
DASHBOARD.VIEW_OPERATOR_PANEL
DASHBOARD.VIEW_SUPERVISOR_PANEL

// Reports
REPORTS.VIEW_ALL
REPORTS.VIEW_OWN
REPORTS.VIEW_ASSIGNED
REPORTS.CREATE
REPORTS.EDIT_OWN
REPORTS.EDIT_ALL
REPORTS.DELETE_OWN
REPORTS.DELETE_ALL
REPORTS.ASSIGN
REPORTS.CHANGE_STATUS
REPORTS.VIEW_DETAILS

// Map
MAP.VIEW
MAP.VIEW_ALL_LOCATIONS
MAP.VIEW_ASSIGNED_AREA
MAP.EDIT_LOCATIONS

// Users
USERS.VIEW_ALL
USERS.VIEW_OWN
USERS.CREATE
USERS.EDIT_OWN
USERS.EDIT_ALL
USERS.DELETE
USERS.CHANGE_ROLES
USERS.VIEW_ORGANIZATION

// Settings
SETTINGS.VIEW
SETTINGS.EDIT_OWN
SETTINGS.EDIT_ORGANIZATION
SETTINGS.EDIT_SYSTEM

// Analytics
ANALYTICS.VIEW_OWN
ANALYTICS.VIEW_ORGANIZATION
ANALYTICS.VIEW_ALL
ANALYTICS.EXPORT
```

## Usage Examples

### 1. Using Permission Hooks

```javascript
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS, USERS } from "@/lib/permissions";

function MyComponent() {
  const canViewReports = useHasPermission(REPORTS.VIEW_ALL);
  const canChangeRoles = useHasPermission(USERS.CHANGE_ROLES);

  if (!canViewReports) {
    return <AccessDenied />;
  }

  return (
    <div>
      {canChangeRoles && <RoleChangeButton />}
      <ReportsList />
    </div>
  );
}
```

### 2. Using RequirePermission Components

```javascript
import { RequirePermission } from "@/components/ui/RequirePermission";
import { USERS, REPORTS } from "@/lib/permissions";

function MyComponent() {
  return (
    <div>
      {/* Only renders if user has permission */}
      <RequirePermission permission={USERS.CHANGE_ROLES}>
        <RoleChangeButton />
      </RequirePermission>

      {/* With fallback */}
      <RequirePermission 
        permission={REPORTS.EDIT_ALL}
        fallback={<EditDisabled />}
      >
        <EditButton />
      </RequirePermission>

      {/* Multiple permissions (any) */}
      <RequireAnyPermission 
        permissions={[REPORTS.EDIT_ALL, REPORTS.EDIT_OWN]}
      >
        <EditButton />
      </RequireAnyPermission>
    </div>
  );
}
```

### 3. Protecting Routes

```javascript
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { USERS, REPORTS } from "@/lib/permissions";

// In your route or layout
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute permissions={[USERS.VIEW_ALL, USERS.CHANGE_ROLES]}>
      {children}
    </ProtectedRoute>
  );
}
```

### 4. Permission-Based Navigation

```javascript
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS, MAP, SETTINGS } from "@/lib/permissions";

const navItems = [
  { label: "Reports", permission: REPORTS.VIEW_ALL },
  { label: "Map", permission: MAP.VIEW },
  { label: "Settings", permission: SETTINGS.VIEW },
];

function Sidebar() {
  const hasViewReports = useHasPermission(REPORTS.VIEW_ALL);
  const hasViewMap = useHasPermission(MAP.VIEW);
  const hasViewSettings = useHasPermission(SETTINGS.VIEW);

  const visibleItems = navItems.filter(item => {
    if (item.permission === REPORTS.VIEW_ALL) return hasViewReports;
    if (item.permission === MAP.VIEW) return hasViewMap;
    if (item.permission === SETTINGS.VIEW) return hasViewSettings;
    return true;
  });

  return <nav>{visibleItems.map(renderItem)}</nav>;
}
```

## Adding New Permissions

### Step 1: Define the Permission

In `lib/permissions.js`, add your permission to the appropriate category:

```javascript
export const REPORTS = {
  // ... existing permissions
  EXPORT: "reports:export", // New permission
};
```

### Step 2: Assign to Roles

Add the permission to the `ROLE_PERMISSIONS` mapping:

```javascript
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // ... existing permissions
    REPORTS.EXPORT,
  ],
  [ROLES.DISTRICT_OFFICER]: [
    // ... existing permissions
    REPORTS.EXPORT,
  ],
  // Other roles as needed
};
```

### Step 3: Use in Components

```javascript
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";

function ReportsPage() {
  const canExport = useHasPermission(REPORTS.EXPORT);

  return (
    <div>
      {canExport && <ExportButton />}
      <ReportsList />
    </div>
  );
}
```

## Adding New Roles

### Step 1: Define the Role

In `lib/permissions.js`:

```javascript
export const ROLES = {
  // ... existing roles
  AUDITOR: "auditor",
};

export const ROLE_METADATA = {
  // ... existing roles
  [ROLES.AUDITOR]: {
    label: "Auditor",
    color: "bg-purple-100 text-purple-700",
    description: "Audit and compliance",
  },
};
```

### Step 2: Assign Permissions

```javascript
export const ROLE_PERMISSIONS = {
  [ROLES.AUDITOR]: [
    REPORTS.VIEW_ALL,
    REPORTS.VIEW_DETAILS,
    ANALYTICS.VIEW_ALL,
    ANALYTICS.EXPORT,
    // Read-only access
  ],
};
```

### Step 3: Update Database

Add the new role to your Supabase `profiles` table:

```sql
ALTER TABLE profiles 
ADD CONSTRAINT role_check 
CHECK (role IN (
  'admin', 'district_officer', 'community_officer', 
  'health_officer', 'ngo', 'response_team', 
  'headteacher', 'community_agent', 'sanitation_worker', 
  'field_worker', 'supervisor', 'operator', 'auditor'
));
```

## Best Practices

### 1. Use Permissions, Not Roles

❌ **Don't:**
```javascript
if (profile.role === 'admin') {
  // Show admin features
}
```

✅ **Do:**
```javascript
if (useHasPermission(USERS.CHANGE_ROLES)) {
  // Show role change feature
}
```

### 2. Follow Least Privilege

Only give users the permissions they need for their role. Don't give admin permissions to district officers just for convenience.

### 3. Use Specific Permissions

❌ **Don't:**
```javascript
// Too broad
if (useHasPermission(REPORTS.VIEW_ALL)) {
  <EditButton />
}
```

✅ **Do:**
```javascript
// More specific
if (useHasPermission(REPORTS.EDIT_ALL)) {
  <EditButton />
}
```

### 4. Server-Side Validation

Client-side permission checks are for UX only. Always validate permissions on the server side using Supabase RLS policies or API middleware.

### 5. Document New Permissions

When adding new permissions, update this document and add comments explaining what the permission allows.

## Migration Guide

### Converting Existing Role Checks

**Before:**
```javascript
if (profile.role === 'admin' || profile.role === 'district_officer') {
  <AdminPanel />
}
```

**After:**
```javascript
import { useHasAnyPermission } from "@/hooks/usePermissions";
import { DASHBOARD } from "@/lib/permissions";

if (useHasAnyPermission([DASHBOARD.VIEW_ADMIN_PANEL, DASHBOARD.VIEW_DISTRICT_PANEL])) {
  <AdminPanel />
}
```

### Converting Role-Based Navigation

**Before:**
```javascript
const NAV_BY_ROLE = {
  admin: [{ label: "Users", href: "/users" }],
  district_officer: [{ label: "Users", href: "/users" }],
};
```

**After:**
```javascript
const NAV_ITEMS = [
  { label: "Users", href: "/users", permission: USERS.VIEW_ALL },
];
```

## Testing

### Testing Permission Checks

```javascript
import { renderHook } from "@testing-library/react";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";

test("admin can view all reports", () => {
  const { result } = renderHook(() => useHasPermission(REPORTS.VIEW_ALL), {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={{ profile: { role: 'admin' } }}>
        {children}
      </AuthContext.Provider>
    ),
  });
  expect(result.current).toBe(true);
});
```

## Troubleshooting

### Permission Not Working

1. Check if the permission is defined in `lib/permissions.js`
2. Verify the role has the permission in `ROLE_PERMISSIONS`
3. Ensure the user's role is correctly set in the database
4. Check browser console for any errors

### Navigation Items Not Showing

1. Verify the permission is being checked correctly
2. Ensure the hook is called at the component level (not inside filter/map)
3. Check that the permission is assigned to the user's role

## Future Enhancements

- Resource-level permissions (e.g., `reports:edit:123` for specific report)
- Permission inheritance and hierarchies
- Permission groups for easier management
- Audit logging for permission changes
- Time-based permissions (temporary access)
- IP-based permissions (geo-fencing)
