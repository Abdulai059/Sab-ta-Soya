"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      showFor: ["admin", "operator", "district_officer", "ngo"],
    },
    {
      href: "/admin",
      label: "Admin Panel",
      showFor: ["admin"],
    },
    {
      href: "/operator",
      label: "Operator",
      showFor: ["admin", "operator"],
    },
    {
      href: "/district-officer",
      label: "District Officer",
      showFor: ["admin", "district_officer"],
    },
    {
      href: "/ngo",
      label: "NGO",
      showFor: ["admin", "ngo"],
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 h-12 overflow-x-auto">
          {navItems.map((item) => {
            const shouldShow =
              !item.showFor || item.showFor.includes(profile?.role);

            if (!shouldShow) return null;

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
