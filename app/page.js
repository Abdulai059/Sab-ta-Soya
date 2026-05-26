"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChainPage from "@/components/ui/ChainPage";
import SecurityDashboard from "@/components/ui/Securitychart";

const ROLE_ROUTES = {
  admin:            "/admin",
  district_officer: "/district-officer",
  ngo:              "/ngo",
};

export default function HomePage() {
  const { user, profile, loading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && mounted && user && profile) {
      router.replace(ROLE_ROUTES[profile.role] ?? "/operator");
    }
  }, [user, profile, loading, mounted, router]);

  // While auth is resolving (initial load / refresh) show a minimal spinner
  // so there's no flash of the wrong content
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Logged-in user — show spinner while router.replace() is in flight
  if (user && profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Not logged in — show the public landing page
  return (<div>
    <ChainPage />
    {/* <SecurityDashboard/> */}
    </div>
  );
  
}
