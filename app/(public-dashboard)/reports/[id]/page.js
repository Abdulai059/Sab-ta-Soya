"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useDashboardView } from "@/context/DashboardViewContext";
import ReportHeader from "@/components/reports/detail/ReportHeader";
import ReportInfo from "@/components/reports/detail/ReportInfo";
import WorkflowRoadmap from "@/components/reports/detail/WorkflowRoadmap";
import StatusHistory from "@/components/reports/detail/StatusHistory";
import QuickActions from "@/components/reports/detail/QuickActions";
import LocationImages from "@/components/reports/detail/LocationImages";
import ReportDetailSkeleton from "@/components/reports/detail/ReportDetailSkeleton";
import RiskAssessmentCard from "@/components/reports/detail/RiskAssessmentCard";
import WorkerSelector from "@/components/assignment/WorkerSelector";
import AssignmentHistory from "@/components/assignment/AssignmentHistory";
import VerifyWorkButton from "@/components/reports/detail/VerifyWorkButton";
import { useQueryClient } from "@tanstack/react-query";

export default function ReportDetailPage() {
  const { profile }   = useAuth();
  const router        = useRouter();
  const params        = useParams();
  const dashCtx       = useDashboardView();
  const isInDashboard = !!dashCtx?.goBack;
  const queryClient = useQueryClient();

  const reportId = isInDashboard ? dashCtx.viewParams?.id : params?.id;

  const { report, statusHistory, locationImages, riskAssessment, loading } =
    useReportDetail(reportId);

  const handleBack = () => {
    if (isInDashboard) dashCtx.goBack();
    else router.push("/reports");
  };

  if (loading) return <ReportDetailSkeleton />;

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report not found</h2>
          <button onClick={handleBack} className="text-emerald-600 hover:text-emerald-700">
            ← Back to reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to reports
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <ReportHeader report={report} />
              <ReportInfo report={report} />
            </div>

            {/* Assignment Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <WorkerSelector
                reportId={report.id}
                currentAssignedTo={report.assigned_to}
                onAssignSuccess={() => {
                  // Refresh report data after successful assignment
                  queryClient.invalidateQueries(['report', reportId]);
                }}
              />
            </div>

            <WorkflowRoadmap report={report} statusHistory={statusHistory} />
            
            {/* Verify Work Button */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Verification</h3>
              <VerifyWorkButton
                reportId={report.id}
                reportStatus={report.status}
                userId={profile?.id}
              />
            </div>
            
            {/* Assignment History */}
            <AssignmentHistory reportId={report.id} />
          </div>

          <div className="space-y-6">
            <RiskAssessmentCard risk={riskAssessment} />
            <LocationImages
              images={locationImages}
              locationName={report.location?.name}
              location={report.location}
            />
            <StatusHistory history={statusHistory} />
            <QuickActions profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
