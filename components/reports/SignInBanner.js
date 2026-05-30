import { useRouter } from "next/navigation";

export default function SignInBanner() {
  const router = useRouter();

  return (
    <div className="mt-6 bg-white ounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Sign in to see full details and take action
          </h3>
          <p className="text-gray-600 text-sm">
            View more reports, assign teams, update status, and track
            resolutions — only available to registered users.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-brand-primary text-xs hover:bg-brand-primary text-gray-900 rounded-sm transition-colors"
          >
            Sign in →
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-2 bg-white hover:bg-gray-50  text-xs text-gray-900 border border-gray-300 rounded-sm  transition-colors"
          >
            Report incident →
          </button>
        </div>
      </div>
    </div>
  );
}
