"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PublicNavbar from "./PublicNavbar";

// Routes that manage their own navbar (either DashboardShell or PublicDashboardLayout)
const SELF_MANAGED_ROUTES = [
  "/admin",
  "/operator",
  "/district-officer",
  "/ngo",
  "/community-officer",
  "/health-officer",
  "/supervisor",
  "/my-assignments",
  "/profile",
  "/reports",
  "/reporteissue",
  "/maps",
];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState("map");

  useEffect(() => {
    if (pathname?.startsWith("/safety-tips")) setActiveNav("Safety Tips");
    else if (pathname === "/") setActiveNav("map");
  }, [pathname]);

  const isAuthPage =
    pathname?.includes("/login") ||
    pathname?.includes("/signup");

  const isSelfManaged = SELF_MANAGED_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <>
      {!isAuthPage && !isSelfManaged && (
        <PublicNavbar activeNav={activeNav} onNavChange={setActiveNav} />
      )}
      <main className={!isAuthPage && !isSelfManaged ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
}
