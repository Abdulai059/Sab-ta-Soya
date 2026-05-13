"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      allowedRoles.length > 0 &&
      (!profile?.role || !allowedRoles.includes(profile.role))
    ) {
      router.push("/unauthorized");
      return;
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;
  if (
    allowedRoles.length > 0 &&
    (!profile?.role || !allowedRoles.includes(profile.role))
  ) {
    return null;
  }

  return children;
}
