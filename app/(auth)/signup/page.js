"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { signUp } = useAuth();
  const router = useRouter();
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
        setTimeout(() => router.push("/"), 300);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setTimeout(() => router.push("/"), 300);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [router]);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => router.push("/"), 300);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password);

    if (!error) {
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>
      </div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          ref={modalRef}
          className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Logo/Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zm-7 7a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-600 mt-2">Join SaniTrack today</p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
