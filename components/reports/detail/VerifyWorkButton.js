"use client";

import { ShieldCheck } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { REPORTS } from "@/lib/permissions";
import { useVerifyWork } from "@/hooks/useVerifyWork";

/**
 * VerifyWorkButton Component
 * 
 * Renders a button that allows authorized users (admin, district_officer, supervisor)
 * to verify completed sanitation work. The button only appears when:
 * - The report status is "disposed"
 * - The user has REPORTS.CHANGE_STATUS permission
 * 
 * When clicked, the button triggers the verification workflow which:
 * - Updates the report status to "verified"
 * - Creates a status history record
 * - Displays a success/error notification
 * - Refreshes the UI to reflect the new status
 * 
 * @param {string} reportId - The ID of the report to verify
 * @param {string} reportStatus - The current status of the report
 * @param {string} userId - The ID of the user performing the verification
 */
export default function VerifyWorkButton({ reportId, reportStatus, userId }) {
  const canChangeStatus = useHasPermission(REPORTS.CHANGE_STATUS);
  const { mutate: verifyWork, isPending } = useVerifyWork();

  // Only render when report status is "disposed" and user has permission
  if (reportStatus !== "disposed" || !canChangeStatus) {
    return null;
  }

  const handleVerify = () => {
    verifyWork({ reportId, userId });
  };

  return (
    <button
      onClick={handleVerify}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
    >
      <ShieldCheck className="w-5 h-5" />
      {isPending ? "Verifying..." : "Verify Work"}
    </button>
  );
}
