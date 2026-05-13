"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardHome() {
  const { profile } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Dashboard
        </h3>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Role: {profile?.role}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {profile?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Welcome back!</h3>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-based Navigation */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {(profile?.role === "admin" || profile?.role === "operator") && (
                  <Link
                    href="/dashboard/operator"
                    className="block w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Operator Dashboard
                  </Link>
                )}
                {(profile?.role === "admin" || profile?.role === "district_officer") && (
                  <Link
                    href="/dashboard/district-officer"
                    className="block w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                  >
                    District Officer Dashboard
                  </Link>
                )}
                {(profile?.role === "admin" || profile?.role === "ngo") && (
                  <Link
                    href="/dashboard/ngo"
                    className="block w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    NGO Dashboard
                  </Link>
                )}
                {profile?.role === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="block w-full text-left px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Authentication</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Role Access</span>
                  <span className="text-sm font-medium text-green-600">Configured</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Database</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
