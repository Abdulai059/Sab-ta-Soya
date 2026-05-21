"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PublicNavbar from "./PublicNavbar";
import DashboardNavbar from "./DashboardNavbar";

const DASHBOARD_ROUTES = [
  "/admin",
  "/operator",
  "/district-officer",
  "/ngo",
  "/community-officer",
  "/health-officer",
  "/supervisor",
];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState("map");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (pathname?.startsWith("/reports")) {
      setActiveNav("reports");
    } else if (pathname?.startsWith("/safety-tips")) {
      setActiveNav("Safety Tips");
    } else if (pathname?.startsWith("/maps") || pathname === "/dashboard") {
      setActiveNav("map");
    } else if (pathname?.startsWith("/reporteissue")) {
      setActiveNav("Submitissue");
    }
  }, [pathname]);

  const isAuthPage =
    pathname?.startsWith("/(auth)") ||
    pathname?.includes("/login") ||
    pathname?.includes("/signup");

  const isDashboardPage = DASHBOARD_ROUTES.some((route) =>
    pathname?.startsWith(route),
  );

  const Navbar = isDashboardPage ? DashboardNavbar : PublicNavbar;

  return (
    <>
      {!isAuthPage && !isDashboardPage && (
        <Navbar activeNav={activeNav} onNavChange={setActiveNav} />
      )}
      <main className={!isAuthPage && !isDashboardPage ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
}
