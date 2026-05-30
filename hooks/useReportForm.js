"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

function generateReferenceId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${timestamp}-${random}`;
}

async function uploadPhotos(photos, referenceId) {
  const urls = [];
  for (let i = 0; i < photos.length; i++) {
    try {
      const blob = await fetch(photos[i]).then((r) => r.blob());
      const path = `reports/${referenceId}/${Date.now()}-${i}.jpg`;
      const { error } = await supabase.storage
        .from("report-images")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) {
        console.warn("Photo upload skipped (storage not configured):", error.message);
        continue;
      }
      const { data } = supabase.storage.from("report-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    } catch (err) {
      console.warn("Photo upload skipped:", err.message);
    }
  }
  return urls;
}

export default function useReportForm() {
  const router = useRouter();
  const { profile } = useAuth();

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    issueType:        "",
    severity:         "",
    description:      "",
    healthRisk:       false,
    affectedCount:    "",
    affectedChildren: "",
    locationType:     "",
    community:        "",
    location:         "",
    phone:            "",
    isAnonymous:      false,
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (profile?.phone) set("phone")(profile.phone);
  }, [profile]);

  useEffect(() => {
    async function fetchCommunities() {
      const { data, error } = await supabase
        .from("communities")
        .select("id, name")
        .order("name");
      if (error) toast.error("Failed to load communities");
      else setCommunities(data || []);
      setCommunitiesLoading(false);
    }
    fetchCommunities();
  }, []);

  useEffect(() => {
    set("location")("");
    setLocations([]);
    if (!form.community) return;

    const community = communities.find((c) => c.name === form.community);
    if (!community) return;

    setLocationsLoading(true);
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name")
        .eq("community_id", community.id)
        .order("name");
      if (error) toast.error("Failed to load locations");
      else setLocations(data || []);
      setLocationsLoading(false);
    }
    fetchLocations();
  }, [form.community, communities]);

  const handleCancel = () => router.push("/reports");
  const handleSuccess = () => router.push("/reports");

  const handleSubmit = async () => {
    if (!form.issueType)    return toast.error("Please select an issue type");
    if (!form.severity)     return toast.error("Please select a severity level");
    if (!form.phone)        return toast.error("Please enter a phone number");
    if (!form.community)    return toast.error("Please select a community");
    if (!form.locationType) return toast.error("Please select a location type");
    if (form.affectedChildren !== "" && parseInt(form.affectedChildren) < 0)
      return toast.error("Affected children count cannot be negative");

    setSubmitting(true);
    try {
      const referenceId = generateReferenceId();
      const community   = communities.find((c) => c.name === form.community);
      const communityId = community?.id ?? null;
      const location    = locations.find((l) => l.name === form.location);
      const locationId  = location?.id ?? null;
      const uploadedUrls = await uploadPhotos(photos, referenceId);

      const { error } = await supabase.from("sanitation_reports").insert({
        reference_id:            referenceId,
        issue_type:              form.issueType,
        severity:                form.severity,
        description:             form.description || null,
        health_risk:             form.healthRisk,
        reporter_phone:          form.phone,
        affected_people_count:   form.affectedCount ? parseInt(form.affectedCount) : null,
        affected_children_count: form.affectedChildren ? parseInt(form.affectedChildren) : null,
        location_type:           form.locationType,
        is_anonymous:            form.isAnonymous,
        status:                  "pending",
        community_id:            communityId,
        location_id:             locationId,
        reported_by:             profile?.id || null,
      });

      if (error) throw error;

      if (locationId && uploadedUrls.length > 0) {
        const imageRows = uploadedUrls.map((url) => ({
          location_id: locationId,
          image_url:   url,
          image_type:  "report",
          uploaded_by: profile?.id || null,
        }));
        const { error: imgError } = await supabase.from("location_images").insert(imageRows);
        if (imgError) console.error("location_images insert failed:", imgError);
      }

      toast.success("Report submitted successfully");
      handleSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form, set, photos, setPhotos, geoData, setGeoData,
    submitting, communities, communitiesLoading,
    locations, locationsLoading,
    handleSubmit, handleCancel,
  };
}
