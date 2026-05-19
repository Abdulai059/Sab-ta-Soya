"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function WashIllustration() {
  return (
    <svg
      viewBox="0 0 420 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto"
      aria-hidden="true"
    >
      <ellipse cx="210" cy="420" rx="160" ry="18" fill="#9dc43b" opacity="0.15" />

      <path
        d="M210 55 L270 80 L270 155 C270 195 242 228 210 240 C178 228 150 195 150 155 L150 80 Z"
        fill="#9dc43b"
        opacity="0.15"
        stroke="#9dc43b"
        strokeWidth="2"
      />
      <path
        d="M210 70 L258 91 L258 155 C258 188 236 216 210 226 C184 216 162 188 162 155 L162 91 Z"
        fill="#9dc43b"
        opacity="0.25"
      />
      <path
        d="M192 150 L204 162 L228 138"
        stroke="#16a34a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <ellipse cx="210" cy="248" rx="30" ry="9" stroke="#9dc43b" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="210" cy="248" rx="48" ry="14" stroke="#9dc43b" strokeWidth="1" fill="none" opacity="0.3" />
      <ellipse cx="210" cy="248" rx="66" ry="19" stroke="#9dc43b" strokeWidth="0.8" fill="none" opacity="0.15" />

      <rect x="60" y="270" width="300" height="120" rx="18" fill="#f0fdf4" stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1="60" y1="300" x2="360" y2="300" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <line x1="60" y1="330" x2="360" y2="330" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <line x1="60" y1="360" x2="360" y2="360" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <line x1="140" y1="270" x2="140" y2="390" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <line x1="210" y1="270" x2="210" y2="390" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <line x1="280" y1="270" x2="280" y2="390" stroke="#9dc43b" strokeWidth="0.8" opacity="0.35" />
      <path d="M160 295 C156 295 153 298 153 302 C153 307 160 314 160 314 C160 314 167 307 167 302 C167 298 164 295 160 295Z" fill="#9dc43b" />
      <circle cx="160" cy="302" r="2.5" fill="white" />
      <path d="M240 318 C236 318 233 321 233 325 C233 330 240 337 240 337 C240 337 247 330 247 325 C247 321 244 318 240 318Z" fill="#ef4444" />
      <circle cx="240" cy="325" r="2.5" fill="white" />
      <path d="M300 285 C296 285 293 288 293 292 C293 297 300 304 300 304 C300 304 307 297 307 292 C307 288 304 285 300 285Z" fill="#f59e0b" />
      <circle cx="300" cy="292" r="2.5" fill="white" />

      <rect x="18" y="155" width="128" height="70" rx="14" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="42" cy="180" r="10" fill="#dcfce7" />
      <path d="M38 180 L41 183 L47 177" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="58" y="177" fontFamily="system-ui" fontSize="11" fontWeight="700" fill="#111827">Districts</text>
      <text x="58" y="191" fontFamily="system-ui" fontSize="10" fill="#6b7280">Covered</text>
      <text x="42" y="212" fontFamily="system-ui" fontSize="22" fontWeight="800" fill="#9dc43b">16</text>

      {/* Right stat badge */}
      <rect x="274" y="155" width="128" height="70" rx="14" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="298" cy="180" r="10" fill="#fef3c7" />
      <path d="M298 175 L298 181 M298 183 L298 185" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <text x="314" y="177" fontFamily="system-ui" fontSize="11" fontWeight="700" fill="#111827">Operators</text>
      <text x="314" y="191" fontFamily="system-ui" fontSize="10" fill="#6b7280">Active</text>
      <text x="298" y="212" fontFamily="system-ui" fontSize="22" fontWeight="800" fill="#f59e0b">5</text>

      {/* Bottom label */}
      <text x="210" y="408" textAnchor="middle" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#4b5563">
        Join the WASH monitoring network
      </text>
    </svg>
  );
}

export default function SignUpPage({ onCloseModal, onSwitchToSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error, shouldRedirectToLogin } = await signUp(email, password);
    
    if (!error) {
      // Redirect to login page after successful signup
      setTimeout(() => {
        if (onCloseModal) onCloseModal();
        router.push("/login");
      }, 1500);
    } else if (shouldRedirectToLogin) {
      // User already exists, redirect to login
      setTimeout(() => {
        if (onSwitchToSignIn) {
          onSwitchToSignIn();
        } else {
          router.push("/login");
        }
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex w-full max-w-4xl mx-4 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white">

        <div className="flex flex-col justify-center w-full lg:w-1/2 px-10 py-14">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-lg tracking-tight">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
              </svg>
              SaniTrack
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-1">Create account</h1>
          <p className="text-stone-500 text-sm mb-8">
            Join the WASH monitoring network — it only takes a moment.
          </p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-stone-500 text-center">
            Already have an account?{" "}
            {onSwitchToSignIn ? (
              <button
                onClick={onSwitchToSignIn}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Sign in
              </button>
            ) : (
              <Link
                href="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            )}
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#f0fdf4] rounded-l-[2.5rem] px-12 py-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-200 opacity-20" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-300 opacity-15" />

          <WashIllustration />

          <div className="mt-8 text-center relative z-10">
            <h2 className="text-xl font-bold text-stone-800 leading-snug">
              Built for WASH professionals.
            </h2>
            <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">
              Coordinate field operators, district officers, and NGOs on one unified platform.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-8">
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
            <span className="w-6 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

      </div>
    </div>
  );
}
