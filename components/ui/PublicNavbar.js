"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
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
  Bell,
} from "lucide-react";
import Modal from "./Modal";
import LoginPage from "@/app/(auth)/login/page";
import SignUpPage from "@/app/(auth)/signup/page";

const NAV_ITEMS = [
  { id: "map", label: "Map", icon: Map, href: null },
  {
    id: "reports",
    label: "Reports list",
    icon: ClipboardList,
    href: "/reports",
  },
  {
    id: "Submitissue",
    label: "Submit issue",
    icon: BarChart3,
    href: "/reporteissue",
  },
  {
    id: "Safety Tips",
    label: "Safety Tips 🧼",
    icon: Settings,
    href: "/safety-tips",
  },
];

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

const buttonStyles =
  "rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95";

export default function PublicNavbar({ activeNav, onNavChange }) {
  const { profile, signOut } = useAuth();
  const isAuthenticated = !!profile;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleColor = ROLE_COLORS[profile?.role] ?? "bg-stone-100 text-stone-600";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-stone-200/70 bg-white backdrop-blur-xl">
        <div className="h-16 max-w-[98rem] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 rounded-2xl bg-brand-yellowish-green flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                <Droplets className="w-5 h-5 text-white" />
              </div>

              <div className="leading-tight hidden sm:block">
                <h1 className="text-[15px] font-bold tracking-tight text-stone-900">
                  Sab<span className="text-emerald-600">'ta</span>
                </h1>

                <p className="text-[11px] text-stone-400">
                  Smart sanitation monitoring
                </p>
              </div>
            </Link>

            <div className="hidden lg:block w-px h-7 bg-stone-200" />

            <nav className="hidden md:flex gap-4 items-center gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                const isMap = id === "map";
                const active = activeNav === id;

                const baseClass =
                  "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200";

                const stateClass = isMap
                  ? active
                    ? "bg-brand-primary text-gray-900 shadow-sm"
                    : "hover:bg-brand-soft-highlight text-gray-900 bg-brand-primary"
                  : active
                    ? "bg-brand-highlight text-gray-900 shadow-sm"
                    : "text-stone-500 hover:bg-brand-soft-highlight hover:text-stone-900";

                const className = `${baseClass} ${stateClass}`;

                const content = (
                  <>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>

                    {active && (
                      <span className="absolute inset-x-3 -bottom-[9px] h-[2px] rounded-full bg-emerald-500" />
                    )}
                  </>
                );

                // MAP = BUTTON (NO ROUTE)
                if (isMap) {
                  return (
                    <button
                      key={id}
                      onClick={() => onNavChange?.(id)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                }

                // OTHERS = LINKS
                return (
                  <Link
                    key={id}
                    href={href}
                    onClick={() => onNavChange?.(id)}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 h-10 w-64 rounded-xl border border-stone-200 bg-stone-50/80 px-3 transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />

              <input
                type="text"
                placeholder="Search reports..."
                className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
              />
            </div>

            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
              <Bell className="w-4 h-4 text-stone-600" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {isAuthenticated ? (
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
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <Modal>
                  <Modal.Open opens="sign-in">
                    <button
                      className={`${buttonStyles} bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900`}
                    >
                      Login
                    </button>
                  </Modal.Open>

                  <Modal.Window name="sign-in">
                    <LoginPage />
                  </Modal.Window>

                  <Modal.Window name="sign-up">
                    <SignUpPage />
                  </Modal.Window>
                </Modal>
              </div>
            )}

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

        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
              const active = activeNav === id;
              const commonClass = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-soft text-white"
                  : "text-stone-600 hover:bg-brand-soft-highlight hover:text-stone-900"
              }`;
              const handleClick = () => {
                onNavChange?.(id);
                setMobileOpen(false);
              };
              const content = (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-emerald-400" : ""}`}
                  />
                  {label}
                </>
              );

              return href ? (
                <Link
                  key={id}
                  href={href}
                  onClick={handleClick}
                  className={commonClass}
                >
                  {content}
                </Link>
              ) : (
                <button key={id} onClick={handleClick} className={commonClass}>
                  {content}
                </button>
              );
            })}

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
                <Modal>
                  <div className="flex flex-col gap-2">
                    <Modal.Open opens="sign-in">
                      <button
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center rounded-xl px-4 py-2.5 text-sm font-medium border bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Sign In
                      </button>
                    </Modal.Open>

                    <Modal.Open opens="sign-up">
                      <button
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center rounded-xl px-4 py-2.5 text-sm font-medium bg-brand-soft text-gray-900 hover:bg-brand-soft-highlight transition-colors"
                      >
                        Sign Up
                      </button>
                    </Modal.Open>
                  </div>

                  <Modal.Window name="sign-in">
                    <LoginPage />
                  </Modal.Window>

                  <Modal.Window name="sign-up">
                    <SignUpPage />
                  </Modal.Window>
                </Modal>
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
