"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import DashboardNav from "@/components/ui/DashboardNav";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
