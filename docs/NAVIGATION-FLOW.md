# Navigation Flow Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC AREA                              │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Landing    │  User not authenticated                       │
│  │   Page (/)   │  ─────────────────────────►                  │
│  └──────────────┘                                               │
│         │                                                        │
│         │ Click "Login"                                         │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Login Page   │                                               │
│  │ (/login)     │                                               │
│  └──────────────┘                                               │
│         │                                                        │
│         │ Authenticate                                          │
│         ▼                                                        │
└─────────────────────────────────────────────────────────────────┘
          │
          │ Redirect to role-specific dashboard
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD AREA                              │
│                   (User stays here until logout)                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Dashboard Shell (Persistent Layout)                       │ │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │   Sidebar    │  │      Main Content Area           │  │ │
│  │  │              │  │                                   │  │ │
│  │  │ • Analytics  │  │  ┌─────────────────────────────┐ │  │ │
│  │  │ • Reports    │  │  │  Active View Component      │ │  │ │
│  │  │ • My Tasks   │  │  │  (Dynamically loaded)       │ │  │ │
│  │  │ • Live Map   │  │  │                             │ │  │ │
│  │  │ • Submit     │  │  │  • Analytics Dashboard      │ │  │ │
│  │  │ • Users      │  │  │  • Reports List             │ │  │ │
│  │  │ • Profile    │  │  │  • Report Detail            │ │  │ │
│  │  │              │  │  │  • My Assignments           │ │  │ │
│  │  │ ─────────    │  │  │  • Live Map                 │ │  │ │
│  │  │ Sign Out     │  │  │  • Submit Issue             │ │  │ │
│  │  └──────────────┘  │  │  • User Management          │ │  │ │
│  │         │           │  │  • Profile                  │ │  │ │
│  │         │           │  └─────────────────────────────┘ │  │ │
│  │         │           │                                   │  │ │
│  │         │ Click     │  ◄─── View-based navigation ───┐ │  │ │
│  │         │ nav item  │       (No page reload)          │ │  │ │
│  │         └───────────┼───────────────────────────────►─┘ │  │ │
│  │                     │                                     │  │ │
│  └─────────────────────┴─────────────────────────────────────┘ │
│                                                                  │
│  Navigation within dashboard:                                   │
│  • setView("reports") ──► Shows reports list                   │
│  • setView("reportDetail", {id}) ──► Shows report detail       │
│  • setView("my-assignments") ──► Shows assignments             │
│  • setView("map") ──► Shows live map                           │
│                                                                  │
│  URL stays at: /admin, /operator, /district-officer, etc.      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │
          │ Click "Sign Out"
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC AREA                              │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Landing    │  User logged out                              │
│  │   Page (/)   │  ◄────────────────────                       │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Route Structure

### Public Routes (Outside Dashboard)
```
/                    → Landing page (ChainPage)
/login               → Login page
/signup              → Signup page
/unauthorized        → Error page
```

### Protected Routes (Inside Dashboard)
```
/admin               → Admin dashboard (Analytics view)
/operator            → Operator dashboard (Reports view)
/district-officer    → District officer dashboard
/ngo                 → NGO dashboard
/community-officer   → Community officer dashboard
/health-officer      → Health officer dashboard
```

### Views (Rendered within Dashboard Shell)
```
analytics            → Admin analytics dashboard
reports              → Reports list
reportDetail         → Report detail (with params: {id})
my-assignments       → Worker assignments
map                  → Live map
submit               → Submit issue form
users                → User management
district             → District panel
ngo                  → NGO portal
operator             → Operator panel
profile              → User profile
```

## Navigation Methods

### View-Based (Inside Dashboard)
```javascript
// Using DashboardViewContext
const { setView } = useDashboardView();

// Navigate to a view
setView("reports");

// Navigate with parameters
setView("reportDetail", { id: "123" });

// Go back
goBack();

// Clear and go to default view
clearView();
```

### Route-Based (Outside Dashboard)
```javascript
// Using Next.js router (only for auth flow)
import { useRouter } from "next/navigation";
const router = useRouter();

router.push("/login");
router.replace("/admin");
```

## Key Features

### 1. **Containment**
- Authenticated users stay within dashboard
- No accidental navigation to public pages
- Consistent layout and navigation

### 2. **Performance**
- No full page reloads
- Lazy-loaded view components
- Faster navigation

### 3. **Security**
- All dashboard routes protected by ProtectedRoute
- Automatic redirect to login if not authenticated
- Role-based access control

### 4. **User Experience**
- Smooth transitions between views
- Persistent sidebar and navbar
- Clear visual feedback
- No loading flashes

## Example User Flows

### Flow 1: Admin Views Report
```
1. Admin logs in → Redirected to /admin
2. Dashboard loads with Analytics view
3. Admin clicks "Reports" in sidebar
4. setView("reports") called
5. Reports list rendered in main content area
6. Admin clicks "View" on a report
7. setView("reportDetail", {id: "123"}) called
8. Report detail rendered in main content area
9. URL stays at /admin throughout
```

### Flow 2: Worker Accepts Assignment
```
1. Worker logs in → Redirected to /operator
2. Dashboard loads with Reports view
3. Worker clicks "My Assignments" in sidebar
4. setView("my-assignments") called
5. Assignments list rendered with pending/accepted sections
6. Worker clicks "Accept" on pending assignment
7. Assignment moves to accepted section
8. Worker clicks "View Details"
9. setView("reportDetail", {id: "456"}) called
10. Report detail rendered in main content area
11. URL stays at /operator throughout
```

### Flow 3: District Officer Reviews Analytics
```
1. District Officer logs in → Redirected to /district-officer
2. Dashboard loads with District Panel view
3. Officer clicks "Analytics" in sidebar
4. setView("analytics") called
5. Analytics dashboard rendered
6. Officer reviews charts and metrics
7. Officer clicks "Reports" to see details
8. setView("reports") called
9. Reports list rendered
10. URL stays at /district-officer throughout
```
