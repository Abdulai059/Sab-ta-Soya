"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/ui/DashboardShell";
import PublicNavbar from "@/components/ui/PublicNavbar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PublicDashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState("map");

  useEffect(() => {
    if (pathname?.startsWith("/reports")) setActiveNav("reports");
    else if (pathname?.startsWith("/maps")) setActiveNav("map");
    else if (pathname?.startsWith("/reporteissue")) setActiveNav("Submitissue");
  }, [pathname]);

  if (loading) return null;

  if (user) {
    return (
      <DashboardShell>
        {children}
      </DashboardShell>
    );
  }

  return (
    <>
      <PublicNavbar activeNav={activeNav} onNavChange={setActiveNav} />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
