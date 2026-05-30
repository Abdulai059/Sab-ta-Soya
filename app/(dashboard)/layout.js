"use client";

export const dynamic = "force-dynamic";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import DashboardShell from "@/components/ui/DashboardShell";

export default function DashboardLayout({ children }) {
  return (
    <DashboardShell>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </DashboardShell>
  );
}
