/**
 * Permission Hooks
 * 
 * React hooks for checking user permissions throughout the application.
 * These hooks integrate with the AuthContext and the centralized permission system.
 */

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPermissionsForRole,
  roleHasPermission,
  roleHasAnyPermission,
  roleHasAllPermissions,
} from "@/lib/permissions";

/**
 * Hook to get all permissions for the current user
 * @returns {string[]} Array of permission strings
 */
export function usePermissions() {
  const { profile } = useAuth();
  const role = profile?.role;

  return useMemo(() => {
    return getPermissionsForRole(role);
  }, [role]);
}

/**
 * Hook to check if the current user has a specific permission
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export function useHasPermission(permission) {
  const { profile } = useAuth();
  const role = profile?.role;

  return useMemo(() => {
    return roleHasPermission(role, permission);
  }, [role, permission]);
}

/**
 * Hook to check if the current user has any of the given permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function useHasAnyPermission(permissions) {
  const { profile } = useAuth();
  const role = profile?.role;

  return useMemo(() => {
    return roleHasAnyPermission(role, permissions);
  }, [role, permissions]);
}

/**
 * Hook to check if the current user has all of the given permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function useHasAllPermissions(permissions) {
  const { profile } = useAuth();
  const role = profile?.role;

  return useMemo(() => {
    return roleHasAllPermissions(role, permissions);
  }, [role, permissions]);
}

/**
 * Hook to check if the current user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean}
 */
export function useHasRole(role) {
  const { profile } = useAuth();
  const userRole = profile?.role;

  return useMemo(() => {
    return userRole === role;
  }, [userRole, role]);
}

/**
 * Hook to check if the current user has any of the given roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean}
 */
export function useHasAnyRole(roles) {
  const { profile } = useAuth();
  const userRole = profile?.role;

  return useMemo(() => {
    return roles.includes(userRole);
  }, [userRole, roles]);
}
