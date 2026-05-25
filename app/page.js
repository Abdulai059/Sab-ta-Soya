"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Topbar from "@/components/ui/PublicNavbar";

const MapsPage = dynamic(() => import("./maps/page"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-50 text-emerald-500 font-mono text-xs tracking-widest animate-pulse">
      LOADING MAP...
    </div>
  ),
});

export default function HomePage() {
  const { user, profile, loading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && mounted && user && profile) {
      const roleRoutes = {
        admin: "/admin",
        district_officer: "/district-officer",
        ngo: "/ngo",
      };
      const destination = roleRoutes[profile.role] ?? "/operator";
      if (destination) router.push(destination);
    }
  }, [user, profile, loading, mounted, router]);



  if (user && profile) return null;

  return (
    <div className="h-screen flex flex-col bg-[#f3f4f6] overflow-hidden">
      <Topbar />
      <main className="flex-1 min-h-0 pt-4">
        <div className="h-full">
          <MapsPage />
        </div>
      </main>
    </div>
  );
}
