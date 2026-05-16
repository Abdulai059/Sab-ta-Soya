"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Topbar from "@/components/ui/navbar";

const MapsPage = dynamic(() => import("./maps/page"), { ssr: false });

export default function HomePage() {
  const { user, loading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && mounted && user) {
      router.push("/dashboard");
    }
  }, [user, loading, mounted, router]);

  // if (!mounted || loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-white">
  //       <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
  //     </div>
  //   );
  // }

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      <Topbar />
      <main className="flex-1 pt-16">
        <MapsPage />
      </main>
    </div>
  );
}
