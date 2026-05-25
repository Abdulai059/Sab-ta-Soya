"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHasAnyPermission } from "@/hooks/usePermissions";
import { ROLES } from "@/lib/permissions";

export default function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const hasRequiredPermissions = useHasAnyPermission(permissions);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const roleRoutes = {
      [ROLES.ADMIN]: "/admin",
      [ROLES.DISTRICT_OFFICER]: "/district-officer",
      [ROLES.NGO]: "/ngo",
      [ROLES.SUPERVISOR]: "/supervisor",
      [ROLES.OPERATOR]: "/operator",
    };

    if (permissions.length > 0 && !hasRequiredPermissions) {
      router.push(roleRoutes[profile?.role] ?? "/operator");
      return;
    }

    if (roles.length > 0 && profile?.role && !roles.includes(profile.role)) {
      router.push(roleRoutes[profile?.role] ?? "/operator");
    }
  }, [user, profile, loading, permissions, roles, hasRequiredPermissions, router]);

  // While auth resolves, render nothing — the shell already shows the skeleton
  if (loading) return null;

  // Not logged in — redirect in flight
  if (!user) return null;

  if (permissions.length > 0 && !hasRequiredPermissions) return null;
  if (roles.length > 0 && profile?.role && !roles.includes(profile.role)) return null;

  return children;
}
