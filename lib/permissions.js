/**
 * Centralized RBAC Permissions System
 * 
 * This file defines all permissions in the application and maps them to roles.
 * Follows the principle of least privilege - roles only get permissions they need.
 */

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Dashboard & Navigation Permissions
 */
export const DASHBOARD = {
  VIEW_ADMIN_PANEL: "dashboard:view_admin_panel",
  VIEW_DISTRICT_PANEL: "dashboard:view_district_panel",
  VIEW_NGO_PORTAL: "dashboard:view_ngo_portal",
  VIEW_OPERATOR_PANEL: "dashboard:view_operator_panel",
  VIEW_SUPERVISOR_PANEL: "dashboard:view_supervisor_panel",
};

/**
 * Report Permissions
 */
export const REPORTS = {
  VIEW_ALL: "reports:view_all",
  VIEW_OWN: "reports:view_own",
  VIEW_ASSIGNED: "reports:view_assigned",
  CREATE: "reports:create",
  EDIT_OWN: "reports:edit_own",
  EDIT_ALL: "reports:edit_all",
  DELETE_OWN: "reports:delete_own",
  DELETE_ALL: "reports:delete_all",
  ASSIGN: "reports:assign",
  CHANGE_STATUS: "reports:change_status",
  VIEW_DETAILS: "reports:view_details",
};

/**
 * Map Permissions
 */
export const MAP = {
  VIEW: "map:view",
  VIEW_ALL_LOCATIONS: "map:view_all_locations",
  VIEW_ASSIGNED_AREA: "map:view_assigned_area",
  EDIT_LOCATIONS: "map:edit_locations",
};

/**
 * User Management Permissions
 */
export const USERS = {
  VIEW_ALL: "users:view_all",
  VIEW_OWN: "users:view_own",
  CREATE: "users:create",
  EDIT_OWN: "users:edit_own",
  EDIT_ALL: "users:edit_all",
  DELETE: "users:delete",
  CHANGE_ROLES: "users:change_roles",
  VIEW_ORGANIZATION: "users:view_organization",
};

/**
 * Settings Permissions
 */
export const SETTINGS = {
  VIEW: "settings:view",
  EDIT_OWN: "settings:edit_own",
  EDIT_ORGANIZATION: "settings:edit_organization",
  EDIT_SYSTEM: "settings:edit_system",
};

/**
 * Analytics & Statistics Permissions
 */
export const ANALYTICS = {
  VIEW_OWN: "analytics:view_own",
  VIEW_ORGANIZATION: "analytics:view_organization",
  VIEW_ALL: "analytics:view_all",
  EXPORT: "analytics:export",
};

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES = {
  ADMIN: "admin",
  DISTRICT_OFFICER: "district_officer",
  COMMUNITY_OFFICER: "community_officer",
  HEALTH_OFFICER: "health_officer",
  NGO: "ngo",
  RESPONSE_TEAM: "response_team",
  HEADTEACHER: "headteacher",
  COMMUNITY_AGENT: "community_agent",
  SANITATION_WORKER: "sanitation_worker",
  FIELD_WORKER: "field_worker",
  SUPERVISOR: "supervisor",
  OPERATOR: "operator",
};

// ============================================================================
// ROLE DISPLAY METADATA
// ============================================================================

export const ROLE_METADATA = {
  [ROLES.ADMIN]: {
    label: "Administrator",
    color: "bg-violet-100 text-violet-700",
    description: "Full system access",
  },
  [ROLES.DISTRICT_OFFICER]: {
    label: "District Officer",
    color: "bg-sky-100 text-sky-700",
    description: "District-wide oversight",
  },
  [ROLES.COMMUNITY_OFFICER]: {
    label: "Community Officer",
    color: "bg-emerald-100 text-emerald-700",
    description: "Community-level management",
  },
  [ROLES.HEALTH_OFFICER]: {
    label: "Health Officer",
    color: "bg-pink-100 text-pink-700",
    description: "Health-related oversight",
  },
  [ROLES.NGO]: {
    label: "NGO Partner",
    color: "bg-amber-100 text-amber-700",
    description: "NGO partner access",
  },
  [ROLES.RESPONSE_TEAM]: {
    label: "Response Team",
    color: "bg-red-100 text-red-700",
    description: "Emergency response",
  },
  [ROLES.HEADTEACHER]: {
    label: "Head Teacher",
    color: "bg-indigo-100 text-indigo-700",
    description: "School management",
  },
  [ROLES.COMMUNITY_AGENT]: {
    label: "Community Agent",
    color: "bg-teal-100 text-teal-700",
    description: "Field data collection",
  },
  [ROLES.SANITATION_WORKER]: {
    label: "Sanitation Worker",
    color: "bg-lime-100 text-lime-700",
    description: "Sanitation operations",
  },
  [ROLES.FIELD_WORKER]: {
    label: "Field Worker",
    color: "bg-orange-100 text-orange-700",
    description: "Field operations",
  },
  [ROLES.SUPERVISOR]: {
    label: "Supervisor",
    color: "bg-cyan-100 text-cyan-700",
    description: "Team supervision",
  },
  [ROLES.OPERATOR]: {
    label: "Operator",
    color: "bg-stone-100 text-stone-700",
    description: "System operations",
  },
};

// ============================================================================
// ROLE TO PERMISSIONS MAPPING
// ============================================================================

/**
 * Maps each role to its allowed permissions.
 * This is the single source of truth for role-based access.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Dashboard
    DASHBOARD.VIEW_ADMIN_PANEL,
    DASHBOARD.VIEW_DISTRICT_PANEL,
    DASHBOARD.VIEW_NGO_PORTAL,
    DASHBOARD.VIEW_OPERATOR_PANEL,
    DASHBOARD.VIEW_SUPERVISOR_PANEL,
    
    // Reports - Full access
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_ALL,
    REPORTS.DELETE_ALL,
    REPORTS.ASSIGN,
    REPORTS.CHANGE_STATUS,
    REPORTS.VIEW_DETAILS,
    
    // Map - Full access
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    MAP.EDIT_LOCATIONS,
    
    // Users - Full access
    USERS.VIEW_ALL,
    USERS.CREATE,
    USERS.EDIT_ALL,
    USERS.DELETE,
    USERS.CHANGE_ROLES,
    
    // Settings - Full access
    SETTINGS.VIEW,
    SETTINGS.EDIT_SYSTEM,
    
    // Analytics - Full access
    ANALYTICS.VIEW_ALL,
    ANALYTICS.EXPORT,
  ],

  [ROLES.DISTRICT_OFFICER]: [
    // Dashboard
    DASHBOARD.VIEW_DISTRICT_PANEL,
    
    // Reports - District-wide
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_ALL,
    REPORTS.CHANGE_STATUS,
    REPORTS.VIEW_DETAILS,
    REPORTS.ASSIGN,
    
    // Map - District-wide
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View organization
    USERS.VIEW_ORGANIZATION,
    
    // Settings - Organization
    SETTINGS.VIEW,
    SETTINGS.EDIT_ORGANIZATION,
    
    // Analytics - Organization
    ANALYTICS.VIEW_ORGANIZATION,
    ANALYTICS.EXPORT,
  ],

  [ROLES.COMMUNITY_OFFICER]: [
    // Reports - Community-level
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - Assigned area
    MAP.VIEW,
    MAP.VIEW_ASSIGNED_AREA,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
    
    // Analytics - Own
    ANALYTICS.VIEW_OWN,
  ],

  [ROLES.HEALTH_OFFICER]: [
    // Reports - View and create
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
    
    // Analytics - Organization
    ANALYTICS.VIEW_ORGANIZATION,
  ],

  [ROLES.NGO]: [
    // Dashboard
    DASHBOARD.VIEW_NGO_PORTAL,
    
    // Reports - View and create
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View organization
    USERS.VIEW_ORGANIZATION,
    
    // Settings - Organization
    SETTINGS.VIEW,
    SETTINGS.EDIT_ORGANIZATION,
    
    // Analytics - Organization
    ANALYTICS.VIEW_ORGANIZATION,
    ANALYTICS.EXPORT,
  ],

  [ROLES.RESPONSE_TEAM]: [
    // Reports - Assigned and create
    REPORTS.VIEW_ASSIGNED,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.CHANGE_STATUS,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
  ],

  [ROLES.HEADTEACHER]: [
    // Reports - School-related
    REPORTS.VIEW_OWN,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
  ],

  [ROLES.COMMUNITY_AGENT]: [
    // Reports - Create and view own
    REPORTS.VIEW_OWN,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
  ],

  [ROLES.SANITATION_WORKER]: [
    // Reports - View assigned and create
    REPORTS.VIEW_ASSIGNED,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.CHANGE_STATUS,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
  ],

  [ROLES.FIELD_WORKER]: [
    // Reports - Create and view own
    REPORTS.VIEW_OWN,
    REPORTS.CREATE,
    REPORTS.EDIT_OWN,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    
    // Users - View own
    USERS.VIEW_OWN,
    USERS.EDIT_OWN,
    
    // Settings - Own
    SETTINGS.VIEW,
    SETTINGS.EDIT_OWN,
  ],

  [ROLES.SUPERVISOR]: [
    // Dashboard
    DASHBOARD.VIEW_SUPERVISOR_PANEL,
    
    // Reports - Team oversight
    REPORTS.VIEW_ALL,
    REPORTS.CREATE,
    REPORTS.EDIT_ALL,
    REPORTS.CHANGE_STATUS,
    REPORTS.VIEW_DETAILS,
    REPORTS.ASSIGN,
    
    // Map - View
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View organization
    USERS.VIEW_ORGANIZATION,
    
    // Settings - Organization
    SETTINGS.VIEW,
    SETTINGS.EDIT_ORGANIZATION,
    
    // Analytics - Organization
    ANALYTICS.VIEW_ORGANIZATION,
    ANALYTICS.EXPORT,
  ],

  [ROLES.OPERATOR]: [
    // Dashboard
    DASHBOARD.VIEW_OPERATOR_PANEL,
    
    // Reports - View all
    REPORTS.VIEW_ALL,
    REPORTS.VIEW_DETAILS,
    
    // Map - View
    MAP.VIEW,
    MAP.VIEW_ALL_LOCATIONS,
    
    // Users - View all
    USERS.VIEW_ALL,
    
    // Settings - View
    SETTINGS.VIEW,
    
    // Analytics - View all
    ANALYTICS.VIEW_ALL,
  ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all permissions for a given role
 * @param {string} role - The role identifier
 * @returns {string[]} Array of permission strings
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 * @param {string} role - The role identifier
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export function roleHasPermission(role, permission) {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the given permissions
 * @param {string} role - The role identifier
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function roleHasAnyPermission(role, permissions) {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.some((perm) => rolePermissions.includes(perm));
}

/**
 * Check if a role has all of the given permissions
 * @param {string} role - The role identifier
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function roleHasAllPermissions(role, permissions) {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.every((perm) => rolePermissions.includes(perm));
}
