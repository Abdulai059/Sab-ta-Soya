import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useReportDetail(reportId) {
  const [report, setReport] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [locationImages, setLocationImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportDetails = useCallback(async () => {
    try {
      setLoading(true);

      const { data: reportData, error: reportError } = await supabase
        .from("sanitation_reports")
        .select(
          `
          *,
          location:locations(
            id,
            name,
            area_name,
            landmark,
            latitude,
            longitude,
            type,
            status,
            water_access,
            climate_risk,
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
        `,
        )
        .eq("id", reportId)
        .single();

      if (reportError) throw reportError;

      setReport(reportData);

      if (reportData?.location?.id) {
        const { data: imagesData } = await supabase
          .from("location_images")
          .select("id, image_url, image_type, caption")
          .eq("location_id", reportData.location.id)
          .order("created_at", { ascending: true });

        setLocationImages(imagesData || []);
      }

      const { data: assignmentsData } = await supabase
        .from("report_assignments")
        .select(
          `
          *,
          assigned_to_profile:profiles!assigned_to(full_name, phone, role),
          assigned_by_profile:profiles!assigned_by(full_name, role)
        `,
        )
        .eq("report_id", reportId)
        .order("assigned_at", { ascending: false });

      setAssignments(assignmentsData || []);

      const { data: historyData } = await supabase
        .from("report_status_history")
        .select(
          `
          *,
          changed_by_profile:profiles!changed_by(full_name, role)
        `,
        )
        .eq("report_id", reportId)
        .order("changed_at", { ascending: false });

      setStatusHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReportDetails();
    }
  }, [reportId, fetchReportDetails]);

  return { report, assignments, statusHistory, locationImages, loading };
}
