"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardNav() {
  const { profile, signOut } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      className: "border-blue-500 text-gray-900",
    },
    {
      href: "/maps",
      label: "Live Map",
      className: "border-emerald-500 text-gray-900",
      icon: "🗺️",
    },
    {
      href: "/dashboard/operator",
      label: "Operator",
      showFor: ["admin", "operator"],
    },
    {
      href: "/dashboard/district-officer",
      label: "District Officer",
      showFor: ["admin", "district_officer"],
    },
    {
      href: "/dashboard/ngo",
      label: "NGO",
      showFor: ["admin", "ngo"],
    },
    {
      href: "/dashboard/admin",
      label: "Admin Panel",
      showFor: ["admin"],
    },
  ];

  return (
    <nav className="bg-white shadow border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              SaniTrack
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item, index) => {
              const shouldShow =
                !item.showFor || item.showFor.includes(profile?.role);

              if (!shouldShow) return null;

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`${item.className || "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center gap-1.5 px-3 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile?.email}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {profile?.role}
              </span>
            </span>

            <button
              onClick={signOut}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </nav>
  );
}
