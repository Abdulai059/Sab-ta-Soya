"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import DashboardNav from "@/components/ui/DashboardNav";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        {children}
      </div>
    </ProtectedRoute>
  );
}
