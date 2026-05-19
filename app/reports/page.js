"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  Lock, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Cloud,
  List
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    critical: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, activeFilter, searchQuery]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sanitation_reports")
        .select(`
          *,
          location:locations(name, area_name, landmark),
          community:communities(name, district, region),
          reported_by_profile:profiles!reported_by(full_name, phone),
          climate_event:climate_events(event_type, severity)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(
      (r) => r.status === "pending" || r.status === "assigned" || r.status === "in_progress"
    ).length;
    const resolved = data.filter((r) => r.status === "resolved").length;
    const critical = data.filter(
      (r) => r.severity === "critical" || r.health_risk
    ).length;

    setStats({ total, pending, resolved, critical });
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (activeFilter === "pending") {
      filtered = filtered.filter(
        (r) => r.status === "pending" || r.status === "assigned" || r.status === "in_progress"
      );
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((r) => r.status === "resolved");
    } else if (activeFilter === "critical") {
      filtered = filtered.filter((r) => r.severity === "critical" || r.health_risk);
    } else if (activeFilter === "climate") {
      filtered = filtered.filter((r) => r.climate_event_id);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.issue_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.community?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffInSeconds = Math.floor((now - reportDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return reportDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sanitation reports</h1>
          <p className="text-gray-600">
            Publicly reported sanitation incidents across Northern Ghana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-4xl font-bold mb-1 text-gray-900">{stats.total}</div>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              Total reports
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-4xl font-bold mb-1 text-orange-600">
              {stats.pending}
            </div>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Pending / In progress
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-4xl font-bold mb-1 text-emerald-600">
              {stats.resolved}
            </div>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Resolved
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-4xl font-bold mb-1 text-red-600">
              {stats.critical}
            </div>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Critical / health risk
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeFilter === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
            All
          </button>

          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeFilter === "pending"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>

          <button
            onClick={() => setActiveFilter("resolved")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Resolved
          </button>

          <button
            onClick={() => setActiveFilter("critical")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeFilter === "critical"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Critical
          </button>

          <button
            onClick={() => setActiveFilter("climate")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
              activeFilter === "climate"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Cloud className="w-4 h-4" />
            Climate-linked
          </button>

          <div className="ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ref ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Issue / Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reported
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-emerald-600 font-mono text-sm font-medium">
                          {report.reference_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium mb-1">
                          {report.issue_type}
                          {report.location?.name && ` — ${report.location.name}`}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {report.community?.name} · {report.community?.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                            report.severity
                          )}`}
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                        {formatTimeAgo(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/reports/${report.id}`)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {!profile && (
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Sign in to take action"
                            >
                              <Lock className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!profile && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign in →
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg font-medium transition-colors"
                >
                  Report incident →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredReports.length} of {stats.total} reports
          </div>
        </div>
      </div>
    </div>
  );
}
