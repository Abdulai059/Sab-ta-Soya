"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Droplets, MapPin, BarChart2, Zap } from "lucide-react";
import Topbar from "../components/ui/navbar";
import MapsPage from "./maps/page";

const FEATURES = [
  {
    icon: MapPin,
    color: "bg-emerald-500",
    title: "Track Incidents",
    description:
      "Report and monitor sanitation issues in real-time across all districts.",
  },
  {
    icon: BarChart2,
    color: "bg-teal-600",
    title: "Manage Data",
    description: "Powerful analytics and insights for smarter decision making.",
  },
  {
    icon: Zap,
    color: "bg-stone-800",
    title: "Quick Response",
    description:
      "Coordinate rapid response to sanitation emergencies efficiently.",
  },
];

export default function HomePage() {
  const { user, loading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && mounted) {
      router.push("/dashboard");
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="">
        <Topbar />
      </div>

      <main className="max-w-392 mx-auto px-0 pt-30 pb-20 text-center">
        <MapsPage />
      </main>
    </div>
  );
}
