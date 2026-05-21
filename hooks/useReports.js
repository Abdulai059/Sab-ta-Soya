import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sanitation_reports")
        .select(
          `
          *,
          location:locations(name, area_name, landmark, latitude, longitude),
          community:communities(name, district, region),
          reported_by_profile:profiles!reported_by(full_name, phone),
          climate_event:climate_events(event_type, severity)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  return { reports, loading, refetch: fetchReports };
}
