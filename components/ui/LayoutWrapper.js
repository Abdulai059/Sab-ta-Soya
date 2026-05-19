"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState("map");

  useEffect(() => {
    if (pathname?.startsWith("/reports")) {
      setActiveNav("reports");
    } else if (pathname?.startsWith("/child-safety")) {
      setActiveNav("ChildSafety");
    } else if (pathname?.startsWith("/safety-tips")) {
      setActiveNav("Safety Tips");
    } else if (pathname?.startsWith("/maps") || pathname === "/dashboard") {
      setActiveNav("map");
    }
  }, [pathname]);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  return (
    <>
      {!isAuthPage && (
        <Navbar activeNav={activeNav} onNavChange={setActiveNav} />
      )}
      <main className={!isAuthPage ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
}
