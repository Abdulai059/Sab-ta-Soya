/**
 * RequirePermission Component
 *
 * A wrapper component that conditionally renders its children based on user permissions.
 * Supports both single permission checks and multiple permission checks (any/all).
 */

import { useAuth } from "@/context/AuthContext";
import {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
} from "@/hooks/usePermissions";

/**
 * Renders children only if the user has the specified permission
 */
export function RequirePermission({ permission, fallback = null, children }) {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}

/**
 * Renders children only if the user has any of the specified permissions
 */
export function RequireAnyPermission({
  permissions,
  fallback = null,
  children,
}) {
  const hasAny = useHasAnyPermission(permissions);

  if (!hasAny) {
    return fallback;
  }

  return children;
}

/**
 * Renders children only if the user has all of the specified permissions
 */
export function RequireAllPermissions({
  permissions,
  fallback = null,
  children,
}) {
  const hasAll = useHasAllPermissions(permissions);

  if (!hasAll) {
    return fallback;
  }

  return children;
}

/**
 * Renders children only if the user has the specified role
 */
export function RequireRole({ role, fallback = null, children }) {
  const { profile } = useAuth();
  const userRole = profile?.role;

  if (userRole !== role) {
    return fallback;
  }

  return children;
}

/**
 * Renders children only if the user has any of the specified roles
 */
export function RequireAnyRole({ roles, fallback = null, children }) {
  const { profile } = useAuth();
  const userRole = profile?.role;

  if (!roles.includes(userRole)) {
    return fallback;
  }

  return children;
}
