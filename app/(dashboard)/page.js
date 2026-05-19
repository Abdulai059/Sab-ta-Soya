"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import dynamic from "next/dynamic";
import MapsPage from "@/app/maps/page";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-stone-50 text-emerald-500 font-mono text-xs">
      Loading map...
    </div>
  ),
});

export default function DashboardHome() {
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
      title: "Live Map",
      description: "View real-time sanitation incidents and field workers",
      href: "/maps",
      showFor: ["admin", "operator", "district_officer", "ngo"],
      color: "bg-emerald-600",
      icon: "🗺️",
    },
    {
      title: "Operator Dashboard",
      description: "Manage sanitation operations and field activities",
      href: "/operator",
      showFor: ["admin", "operator"],
      color: "bg-blue-600",
      icon: "🔧",
    },
    {
      title: "District Officer",
      description: "Oversee district-level sanitation initiatives",
      href: "/district-officer",
      showFor: ["admin", "district_officer"],
      color: "bg-green-600",
      icon: "🏛️",
    },
    {
      title: "NGO Management",
      description: "Coordinate NGO partnerships and interventions",
      href: "/ngo",
      showFor: ["admin", "ngo"],
      color: "bg-purple-600",
      icon: "🤝",
    },
    {
      title: "Admin Panel",
      description: "System administration and user management",
      href: "/admin",
      showFor: ["admin"],
      color: "bg-red-600",
      icon: "⚙️",
    },
  ];

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-600">
            Role:{" "}
            <span className="font-semibold capitalize">
              {profile?.role?.replace("_", " ")}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 shrink-0">
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

        <div className="h-[90vh] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div>
            <MapsPage />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
          {roleCards.map((card, index) => {
            const shouldShow =
              !card.showFor || card.showFor.includes(profile?.role);
            if (!shouldShow) return null;

            return (
              <Link
                key={index}
                href={card.href}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}
                >
                  <span className="text-xl">{card.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-xs">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
