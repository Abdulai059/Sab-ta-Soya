"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Bell,
  Droplets,
  Map,
  ClipboardList,
  BarChart3,
  Settings,
  Search,
  Menu,
  LogOut,
  ChevronDown,
  UserCircle2,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "map", label: "Map", icon: Map },
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const ROLE_COLORS = {
  admin: "bg-violet-100 text-violet-700",
  operator: "bg-emerald-100 text-emerald-700",
  district_officer: "bg-sky-100 text-sky-700",
  ngo: "bg-amber-100 text-amber-700",
};

export default function Topbar({ activeNav, onNavChange }) {
  const { profile, signOut } = useAuth();
  const isAuthenticated = !!profile;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleColor = ROLE_COLORS[profile?.role] ?? "bg-stone-100 text-stone-600";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-stone-200/70 bg-white/85 backdrop-blur-xl">
        <div className="h-16 max-w-[98rem] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-5 min-w-0">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                <Droplets className="w-5 h-5 text-white" />
              </div>

              <div className="leading-tight hidden sm:block">
                <h1 className="text-[15px] font-bold tracking-tight text-stone-900">
                  Sani<span className="text-emerald-600">Track</span>
                </h1>

                <p className="text-[11px] text-stone-400">
                  Smart sanitation monitoring
                </p>
              </div>
            </Link>

            {/* DIVIDER */}
            <div className="hidden lg:block w-px h-7 bg-stone-200" />

            {/* NAVIGATION */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeNav === id;

                return (
                  <button
                    key={id}
                    onClick={() => onNavChange(id)}
                    className={`
                      relative flex items-center gap-2 rounded-xl px-4 py-2
                      text-sm font-medium transition-all duration-200
                      ${
                        active
                          ? "bg-brand-soft text-white shadow-sm"
                          : "text-stone-500 hover:bg-brand-soft-highlight hover:text-stone-900"
                      }
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-emerald-400" : ""
                      }`}
                    />

                    <span>{label}</span>

                    {active && (
                      <span className="absolute inset-x-3 -bottom-[9px] h-[2px] rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="hidden lg:flex items-center gap-2 h-10 w-64 rounded-xl border border-stone-200 bg-stone-50/80 px-3 transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />

              <input
                type="text"
                placeholder="Search reports..."
                className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
              />
            </div>

            {/* NOTIFICATIONS */}
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
              <Bell className="w-4 h-4 text-stone-600" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* AUTH SECTION */}
            {isAuthenticated ? (
              /* PROFILE CHIP (desktop) */
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 h-10 pl-2 pr-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                    <UserCircle2 className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex flex-col items-start leading-tight max-w-[130px]">
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

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100 mb-1">
                      <p className="text-[11px] text-stone-400">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {profile.email}
                      </p>
                    </div>

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
            ) : (
              /* GUEST BUTTONS */
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-soft text-gray-900 text-sm font-medium hover:bg-brand-soft-highlight transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-stone-700" />
              ) : (
                <Menu className="w-5 h-5 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1">
            {/* Nav items */}
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onNavChange(id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-soft text-white"
                      : "text-stone-600 hover:bg-brand-soft-highlight hover:text-stone-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-emerald-400" : ""}`}
                  />
                  {label}
                </button>
              );
            })}

            {/* Mobile auth */}
            <div className="border-t border-stone-100 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                      <UserCircle2 className="w-4 h-4 text-white" />
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
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center rounded-xl px-4 py-2.5 text-sm font-medium border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center rounded-xl px-4 py-2.5 text-sm font-medium bg-brand-soft text-gray-900 hover:bg-brand-soft-highlight transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Click-outside overlay for profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
