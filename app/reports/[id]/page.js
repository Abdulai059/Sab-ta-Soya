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
import ReportDetailSkeleton from "@/components/reports/detail/ReportDetailSkeleton";

export default function ReportDetailPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dashCtx = useDashboardView();
  const isInDashboard = !!dashCtx?.goBack;

  const reportId = isInDashboard ? dashCtx.viewParams?.id : params?.id;

  const { report, assignments, statusHistory, locationImages, loading } =
    useReportDetail(reportId);

  const handleBack = () => {
    if (isInDashboard) {
      dashCtx.goBack();
    } else {
      router.push("/reports");
    }
  };

  if (loading) return <ReportDetailSkeleton />;

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report not found</h2>
          <button onClick={handleBack} className="text-emerald-600 hover:text-emerald-700 text-sm">
            ← Back to reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
  );
}
