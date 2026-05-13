"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardHomePage() {
  const { profile, loading, mounted } = useAuth();

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const roleCards = [
    {
      title: "Operator Dashboard",
      description: "Manage sanitation operations and field activities",
      href: "/dashboard/operator",
      showFor: ["admin", "operator"],
      color: "bg-blue-600",
      icon: "🔧",
    },
    {
      title: "District Officer",
      description: "Oversee district-level sanitation initiatives",
      href: "/dashboard/district-officer",
      showFor: ["admin", "district_officer"],
      color: "bg-green-600",
      icon: "🏛️",
    },
    {
      title: "NGO Management",
      description: "Coordinate NGO partnerships and interventions",
      href: "/dashboard/ngo",
      showFor: ["admin", "ngo"],
      color: "bg-purple-600",
      icon: "🤝",
    },
    {
      title: "Admin Panel",
      description: "System administration and user management",
      href: "/dashboard/admin",
      showFor: ["admin"],
      color: "bg-red-600",
      icon: "⚙️",
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold">{profile?.role}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Active Reports</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Pending Reviews</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
        </div>

        {/* Role-Based Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((card, index) => {
            const shouldShow =
              !card.showFor || card.showFor.includes(profile?.role);
            if (!shouldShow) return null;

            return (
              <Link
                key={index}
                href={card.href}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">
                  New sanitation report filed
                </div>
                <div className="text-sm text-gray-600">
                  Tamale, Northern Region
                </div>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">
                  Water quality inspection completed
                </div>
                <div className="text-sm text-gray-600">Savelugu District</div>
              </div>
              <div className="text-sm text-gray-500">5 hours ago</div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900">
                  Emergency response deployed
                </div>
                <div className="text-sm text-gray-600">Yendi Municipality</div>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
