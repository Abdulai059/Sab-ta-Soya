"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Cloud,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportDetailPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchReportDetails();
    }
  }, [params.id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);

      const { data: reportData, error: reportError } = await supabase
        .from("sanitation_reports")
        .select(`
          *,
          location:locations(
            name,
            area_name,
            landmark,
            latitude,
            longitude,
            type,
            description
          ),
          community:communities(
            name,
            district,
            region,
            latitude,
            longitude
          ),
          reported_by_profile:profiles!reported_by(
            full_name,
            phone,
            role,
            organization
          ),
          climate_event:climate_events(
            event_type,
            severity,
            start_date,
            end_date,
            impact_notes
          )
        `)
        .eq("id", params.id)
        .single();

      if (reportError) throw reportError;

      setReport(reportData);

      const { data: assignmentsData } = await supabase
        .from("report_assignments")
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(full_name, phone, role),
          assigned_by_profile:profiles!assigned_by(full_name, role)
        `)
        .eq("report_id", params.id)
        .order("assigned_at", { ascending: false });

      setAssignments(assignmentsData || []);

      const { data: historyData } = await supabase
        .from("report_status_history")
        .select(`
          *,
          changed_by_profile:profiles!changed_by(full_name, role)
        `)
        .eq("report_id", params.id)
        .order("changed_at", { ascending: false });

      setStatusHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Report not found
          </h2>
          <button
            onClick={() => router.push("/reports")}
            className="text-emerald-400 hover:text-emerald-300"
          >
            ← Back to reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/reports")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to reports
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-emerald-400 font-mono text-sm">
                      {report.reference_id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                    {report.health_risk && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                        Health Risk
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{report.issue_type}</h1>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>
              </div>

              {report.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-gray-300">{report.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-medium">{report.location?.name || "N/A"}</p>
                    {report.location?.area_name && (
                      <p className="text-sm text-gray-400">
                        {report.location.area_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Community</p>
                    <p className="font-medium">{report.community?.name}</p>
                    <p className="text-sm text-gray-400">
                      {report.community?.district}, {report.community?.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Reported</p>
                    <p className="font-medium">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {report.affected_people_count && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Affected People</p>
                      <p className="font-medium">{report.affected_people_count}</p>
                    </div>
                  </div>
                )}

                {!report.is_anonymous && report.reported_by_profile && (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Reported By</p>
                        <p className="font-medium">
                          {report.reported_by_profile.full_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {report.reported_by_profile.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Contact</p>
                        <p className="font-medium">{report.reporter_phone}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {report.climate_event && (
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold">Climate Event Linked</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">
                      {report.climate_event.event_type}
                    </span>{" "}
                    - {report.climate_event.severity} severity
                  </p>
                  {report.climate_event.impact_notes && (
                    <p className="text-sm text-gray-400 mt-1">
                      {report.climate_event.impact_notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {assignments.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Assignments</h2>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 bg-gray-750 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {assignment.assigned_to_profile?.full_name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {assignment.assigned_to_profile?.role}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          <p>
                            Assigned{" "}
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                          {assignment.assigned_by_profile && (
                            <p className="text-xs">
                              by {assignment.assigned_by_profile.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {assignment.notes && (
                        <p className="text-sm text-gray-300 mt-2">
                          {assignment.notes}
                        </p>
                      )}
                      {assignment.resolved_at && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          Resolved on{" "}
                          {new Date(assignment.resolved_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {statusHistory.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status History
                </h2>
                <div className="space-y-3">
                  {statusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="relative pl-6 pb-3 border-l-2 border-gray-700 last:border-0"
                    >
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-800"></div>
                      <div className="text-sm">
                        <p className="font-medium">
                          {history.old_status} → {history.new_status}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(history.changed_at).toLocaleString()}
                        </p>
                        {history.changed_by_profile && (
                          <p className="text-xs text-gray-400">
                            by {history.changed_by_profile.full_name}
                          </p>
                        )}
                        {history.notes && (
                          <p className="text-xs text-gray-300 mt-1">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                    Update Status
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Assign Team
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                    Add Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
