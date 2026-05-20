"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useDashboardView } from "@/context/DashboardViewContext";
import ReportHeader from "@/components/reports/detail/ReportHeader";
import ReportInfo from "@/components/reports/detail/ReportInfo";
import ClimateEventBanner from "@/components/reports/detail/ClimateEventBanner";
import AssignmentsList from "@/components/reports/detail/AssignmentsList";
import StatusHistory from "@/components/reports/detail/StatusHistory";
import QuickActions from "@/components/reports/detail/QuickActions";
import LocationImages from "@/components/reports/detail/LocationImages";

export default function ReportDetailPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dashCtx = useDashboardView();
  const isInDashboard = !!dashCtx?.goBack;

  // Use id from dashboard context params if inside dashboard, else from URL
  const reportId = isInDashboard ? dashCtx.viewParams?.id : params?.id;

  const { report, assignments, statusHistory, locationImages, loading } = useReportDetail(reportId);

  const handleBack = () => {
    if (isInDashboard) {
      dashCtx.goBack();
    } else {
      router.push("/reports");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report not found
          </h2>
          <button
            onClick={handleBack}
            className="text-emerald-600 hover:text-emerald-700"
          >
            ← Back to reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:pt-30 pt-0 ">
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
              <ClimateEventBanner climateEvent={report.climate_event} />
            </div>

            <AssignmentsList assignments={assignments} />
          </div>

          <div className="space-y-6">
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
