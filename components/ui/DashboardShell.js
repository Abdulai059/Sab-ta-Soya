"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isMap = pathname?.startsWith("/maps");

  return (
    <>
      <DashboardNavbar />

      <div className="flex h-screen pt-16">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 lg:ml-64 min-h-0 flex flex-col ">
          <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 shadow-sm z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {isMap ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}