"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PublicNavbar from "@/components/ui/PublicNavbar";

const MapsPage = dynamic(() => import("./(dashboard)/maps/page"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-50 text-emerald-500 font-mono text-xs tracking-widest animate-pulse">
      LOADING MAP...
    </div>
  ),
});

const ROLE_ROUTES = {
  admin:              "/admin",
  district_officer:   "/district-officer",
  ngo:                "/ngo",
  operator:           "/operator",
  community_officer:  "/community-officer",
  health_officer:     "/health-officer",
  sanitation_worker:  "/operator",
};

export default function HomePage() {
  const { user, profile, loading, mounted } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("map");

  useEffect(() => {
    if (!loading && mounted && user && profile) {
      const dashboardRoute = ROLE_ROUTES[profile.role] ?? "/operator";
      router.replace(dashboardRoute);
    }
  }, [user, profile, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PublicNavbar activeNav={activeNav} onNavChange={setActiveNav} />
     
      <div className="mt-2 w-[1500px] mx-auto min-h-0" style={{ height: "calc(100vh - 4rem)" }}>
        <MapsPage />
      </div>
    </div>
  );
}
