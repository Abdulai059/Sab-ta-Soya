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
      <ellipse
        cx="210"
        cy="420"
        rx="160"
        ry="18"
        fill="#9dc43b"
        opacity="0.15"
      />

      <rect
        x="60"
        y="260"
        width="300"
        height="130"
        rx="18"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1.5"
      />
      <rect x="60" y="260" width="300" height="130" rx="18" fill="#f0fdf4" />
      <line
        x1="60"
        y1="295"
        x2="360"
        y2="295"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <line
        x1="60"
        y1="325"
        x2="360"
        y2="325"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <line
        x1="60"
        y1="355"
        x2="360"
        y2="355"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <line
        x1="130"
        y1="260"
        x2="130"
        y2="390"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <line
        x1="200"
        y1="260"
        x2="200"
        y2="390"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <line
        x1="270"
        y1="260"
        x2="270"
        y2="390"
        stroke="#9dc43b"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <circle cx="155" cy="310" r="8" fill="#9dc43b" opacity="0.9" />
      <path
        d="M155 302 C150 302 146 306 146 311 C146 318 155 326 155 326 C155 326 164 318 164 311 C164 306 160 302 155 302Z"
        fill="#9dc43b"
      />
      <circle cx="155" cy="311" r="3" fill="white" />
      <circle cx="230" cy="340" r="6" fill="#ef4444" opacity="0.85" />
      <path
        d="M230 334 C226 334 223 337 223 341 C223 346 230 352 230 352 C230 352 237 346 237 341 C237 337 234 334 230 334Z"
        fill="#ef4444"
      />
      <circle cx="230" cy="341" r="2.5" fill="white" />
      <circle cx="290" cy="300" r="6" fill="#f59e0b" opacity="0.85" />
      <path
        d="M290 294 C286 294 283 297 283 301 C283 306 290 312 290 312 C290 312 297 306 297 301 C297 297 294 294 290 294Z"
        fill="#f59e0b"
      />
      <circle cx="290" cy="301" r="2.5" fill="white" />

      <path
        d="M210 40 C210 40 160 110 160 155 C160 183 183 205 210 205 C237 205 260 183 260 155 C260 110 210 40 210 40Z"
        fill="#9dc43b"
        opacity="0.9"
      />
      <path
        d="M210 60 C210 60 175 118 175 155 C175 175 191 192 210 192"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <ellipse
        cx="196"
        cy="120"
        rx="7"
        ry="12"
        fill="white"
        opacity="0.25"
        transform="rotate(-20 196 120)"
      />

      <ellipse
        cx="210"
        cy="215"
        rx="28"
        ry="8"
        stroke="#9dc43b"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      <ellipse
        cx="210"
        cy="215"
        rx="44"
        ry="13"
        stroke="#9dc43b"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <ellipse
        cx="210"
        cy="215"
        rx="60"
        ry="18"
        stroke="#9dc43b"
        strokeWidth="0.8"
        fill="none"
        opacity="0.15"
      />

      <rect
        x="20"
        y="150"
        width="130"
        height="68"
        rx="14"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1.5"
      />
      <circle cx="44" cy="175" r="10" fill="#dcfce7" />
      <path
        d="M40 175 L43 178 L49 172"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="60"
        y="172"
        fontFamily="system-ui"
        fontSize="11"
        fontWeight="700"
        fill="#111827"
      >
        Resolved
      </text>
      <text x="60" y="186" fontFamily="system-ui" fontSize="10" fill="#6b7280">
        Today
      </text>
      <text
        x="44"
        y="207"
        fontFamily="system-ui"
        fontSize="22"
        fontWeight="800"
        fill="#9dc43b"
      >
        24
      </text>

      <rect
        x="270"
        y="150"
        width="130"
        height="68"
        rx="14"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1.5"
      />
      <circle cx="294" cy="175" r="10" fill="#fef3c7" />
      <path
        d="M294 170 L294 176 M294 178 L294 180"
        stroke="#d97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="310"
        y="172"
        fontFamily="system-ui"
        fontSize="11"
        fontWeight="700"
        fill="#111827"
      >
        Active
      </text>
      <text x="310" y="186" fontFamily="system-ui" fontSize="10" fill="#6b7280">
        Reports
      </text>
      <text
        x="294"
        y="207"
        fontFamily="system-ui"
        fontSize="22"
        fontWeight="800"
        fill="#f59e0b"
      >
        11
      </text>

      <text
        x="210"
        y="408"
        textAnchor="middle"
        fontFamily="system-ui"
        fontSize="13"
        fontWeight="600"
        fill="#4b5563"
      >
        Sanitation Monitoring · Northern Ghana
      </text>
    </svg>
  );
}

export default function LoginPage({ onCloseModal, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    if (!result.error) {
      if (onCloseModal) onCloseModal();
      const roleRoutes = {
        admin:             "/admin",
        district_officer:  "/district-officer",
        ngo:               "/ngo",
      };
      const destination = roleRoutes[result.profile?.role] ?? "/operator";
      router.push(destination);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="flex w-full max-w-4xl mx-4 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white">
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-10 py-14">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-lg tracking-tight">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
              </svg>
              Sab'ta Soya
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-1">Sign in</h1>
          <p className="text-stone-500 text-sm mb-8">
            Welcome back enter your credentials to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide"
              >
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-stone-600 uppercase tracking-wide"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-stone-500 text-center">
            Not a member?{" "}
            {onSwitchToSignUp ? (
              <button
                onClick={onSwitchToSignUp}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Register now
              </button>
            ) : (
              <Link
                href="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Register now
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
              Track. Respond. Resolve.
            </h2>
            <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">
              Real-time sanitation incident monitoring across all districts of
              Northern Ghana.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-8">
            <span className="w-6 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
