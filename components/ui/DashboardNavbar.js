"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Droplets,
  LayoutDashboard,
  FileText,
  Map as MapIcon,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronDown,
  UserCircle2,
  X,
  User,
} from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-violet-100 text-violet-700",
  district_officer: "bg-sky-100 text-sky-700",
  community_officer: "bg-emerald-100 text-emerald-700",
  health_officer: "bg-pink-100 text-pink-700",
  ngo: "bg-amber-100 text-amber-700",
  response_team: "bg-red-100 text-red-700",
  headteacher: "bg-indigo-100 text-indigo-700",
  community_agent: "bg-teal-100 text-teal-700",
  sanitation_worker: "bg-lime-100 text-lime-700",
  field_worker: "bg-orange-100 text-orange-700",
  supervisor: "bg-cyan-100 text-cyan-700",
};

export default function DashboardNavbar() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!profile;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleColor = ROLE_COLORS[profile?.role] ?? "bg-stone-100 text-stone-600";

  const getDashboardHome = () => {
    const role = profile?.role;
    if (role === "admin") return "/admin";
    if (role === "district_officer") return "/district-officer";
    if (role === "community_officer") return "/community-officer";
    if (role === "health_officer") return "/health-officer";
    if (role === "ngo") return "/ngo";
    if (role === "operator") return "/operator";
    if (role === "supervisor") return "/supervisor";
    return "/";
  };

  const dashboardHome = getDashboardHome();

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-stone-200/70 bg-white backdrop-blur-xl">
        <div className="h-16 w-[90%] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <Link
              href={dashboardHome}
              className="flex items-center gap-3 shrink-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-yellowish-green flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                <Droplets className="w-5 h-5 text-white" />
              </div>

              <div className="leading-tight hidden sm:block">
                <h1 className="text-[14px] font-bold tracking-tight text-stone-900">
                  Sab<span className="text-emerald-600">'ta</span>
                </h1>

                <p className="text-[10px] text-stone-400">Dashboard</p>
              </div>
            </Link>

            <div className="hidden lg:block w-px h-7 bg-stone-200" />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 h-9 w-56 rounded-lg border border-stone-200 bg-stone-50/80 px-3 transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />

              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
              />
            </div>

            <button className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
              <Bell className="w-4 h-4 text-stone-600" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || profile.email}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <UserCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start leading-tight max-w-[120px]">
                    <span className="text-xs font-medium text-stone-800 truncate w-full">
                      {profile.email}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${roleColor}`}
                    >
                      {profile.role}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100 mb-1">
                      <p className="text-[11px] text-stone-400">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {profile.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/profile");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-stone-700" />
              ) : (
                <Menu className="w-5 h-5 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1">
            <div className="border-t border-stone-100 mt-2 pt-2">
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <UserCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-800 truncate">
                        {profile.email}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${roleColor}`}
                      >
                        {profile.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/profile");
                    }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
