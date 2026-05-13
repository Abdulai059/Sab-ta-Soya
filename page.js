"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardHomePage() {
  const { profile, loading, mounted } = useAuth();

  if (!mounted || loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Role
            </h3>
            <p className="text-3xl font-bold text-indigo-600 capitalize">
              {profile?.role}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">{profile?.email}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
            <p className="text-green-600 font-medium">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
