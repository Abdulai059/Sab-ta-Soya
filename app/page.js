"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Topbar from "@/components/ui/PublicNavbar";

const MapsPage = dynamic(() => import("./maps/page"), { ssr: false });

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

  // if (!mounted || loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-white">
  //       <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
  //     </div>
  //   );
  // }

  if (user && profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      <Topbar />
      <main className="flex-1 pt-14">
        <MapsPage />
      </main>
    </div>
  );
}
