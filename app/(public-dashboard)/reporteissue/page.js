"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import {
  MapPin, AlertTriangle, Camera, User, Leaf, AlertCircle,
  Flame, Skull, HeartCrack, CloudLightning, EyeOff, Hash,
  Send, X, Plus, SwitchCamera, Crosshair, RefreshCw,
  CircleCheck, RotateCcw, ChevronDown, Pencil
} from "lucide-react";

const MAX_PHOTOS = 4;

const ISSUE_TYPES = [
  "Open defecation",
  "Blocked drain",
  "Overflowing latrine",
  "Contaminated water source",
  "Waste dumping",
  "Broken handwashing station",
];

const SEVERITY_OPTIONS = [
  { value: "low",      label: "Low",      Icon: Leaf,         color: "teal"   },
  { value: "medium",   label: "Medium",   Icon: AlertCircle,  color: "amber"  },
  { value: "high",     label: "High",     Icon: Flame,        color: "orange" },
  { value: "critical", label: "Critical", Icon: Skull,        color: "red"    },
];

const severityStyles = {
  teal:   { active: "border-teal-500 bg-teal-50 text-teal-800" },
  amber:  { active: "border-amber-500 bg-amber-50 text-amber-800" },
  orange: { active: "border-orange-500 bg-orange-50 text-orange-800" },
  red:    { active: "border-red-500 bg-red-50 text-red-800" },
};

const LOCATION_TYPES = [
  "Public toilet",
  "Market drain",
  "School latrine",
  "Health centre",
  "Community borehole",
  "Open field",
  "Roadside",
  "Other",
];

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-gray-400" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {children}
      </span>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <span className="text-[13px] text-gray-500 mb-1 block">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition";

function SelectInput({ options, placeholder, value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputCls + " appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={typeof o === "string" ? o : o.id} value={typeof o === "string" ? o : o.name}>
            {typeof o === "string" ? o : o.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function ToggleRow({ icon: Icon, iconColor, label, badge, badgeColor, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50">
      <Icon size={16} className={iconColor} />
      <span className="text-[13px] text-gray-600 flex-1">{label}</span>
      {badge && (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-400 cursor-pointer"
      />
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-100 my-5" />;
}

function GeoSection({ geoData, setGeoData }) {
  const [state, setState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by this browser.");
      setState("error");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoData({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy) + "m",
        });
        setState("success");
      },
      (err) => {
        const msgs = {
          1: "Location access denied. Allow it in browser settings or enter manually.",
          2: "Location unavailable. Try again or enter manually.",
          3: "Location request timed out. Please try again.",
        };
        setErrorMsg(msgs[err.code] || "Unknown error getting location.");
        setState("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setGeoData]);

  const applyManual = () => {
    if (!manualLat || !manualLng) return;
    setGeoData({ lat: parseFloat(manualLat).toFixed(6), lng: parseFloat(manualLng).toFixed(6), accuracy: "manual" });
    setState("success");
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {state === "idle" && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50">
          <div className="flex items-center gap-3">
            <Crosshair size={22} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Capture GPS location</p>
              <p className="text-xs text-gray-400 mt-0.5">Auto-detect your current coordinates</p>
            </div>
          </div>
          <button onClick={detect} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition">
            <Crosshair size={14} /> Detect
          </button>
        </div>
      )}
      {state === "loading" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-purple-50">
          <RefreshCw size={18} className="text-purple-500 animate-spin" />
          <span className="text-sm text-purple-700">Getting your location… please wait</span>
        </div>
      )}
      {state === "success" && (
        <div className="px-4 py-3 bg-emerald-50">
          <div className="flex items-center gap-2 mb-2.5">
            <CircleCheck size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Location captured</span>
            <button onClick={detect} className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 transition">
              <RotateCcw size={11} /> Retake
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ label: "Latitude", val: geoData?.lat }, { label: "Longitude", val: geoData?.lng }, { label: "Accuracy", val: geoData?.accuracy }].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs font-mono text-emerald-900">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {state === "error" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-700 flex-1">{errorMsg}</span>
          <button onClick={detect} className="text-xs px-2.5 py-1 rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 transition">Retry</button>
        </div>
      )}
      <div className="border-t border-gray-100 px-4 py-2.5 bg-white">
        <button onClick={() => setManualOpen((v) => !v)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition">
          <Pencil size={12} />
          {manualOpen ? "Hide manual entry" : "Enter coordinates manually"}
        </button>
        {manualOpen && (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div>
              <FieldLabel>Latitude</FieldLabel>
              <input type="text" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="e.g. 9.4034" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Longitude</FieldLabel>
              <input type="text" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="e.g. -0.8424" className={inputCls} />
            </div>
            <button onClick={applyManual} className="col-span-2 text-xs py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-medium">
              Apply coordinates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CameraSection({ photos, setPhotos }) {
  const [camState, setCamState] = useState("idle");
  const [camError, setCamError] = useState("");
  const [facing, setFacing] = useState("environment");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startStream = useCallback(async (facingMode) => {
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      const msgs = {
        NotAllowedError: "Camera access denied. Please allow camera permission.",
        NotFoundError: "No camera found on this device.",
        NotReadableError: "Camera is in use by another app.",
      };
      setCamError(msgs[e.name] || "Could not access camera.");
      setCamState("error");
    }
  }, []);

  const openCamera = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) return;
    setCamState("active");
    await startStream(facing);
  }, [photos.length, facing, startStream]);

  const closeCamera = useCallback(() => {
    stopStream();
    setCamState("idle");
  }, []);

  const switchCamera = useCallback(async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await startStream(next);
  }, [facing, startStream]);

  const takePhoto = useCallback(() => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas) return;
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext("2d").drawImage(vid, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhotos((prev) => {
      const next = [...prev, dataUrl];
      if (next.length >= MAX_PHOTOS) closeCamera();
      return next;
    });
  }, [closeCamera, setPhotos]);

  const deletePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  useEffect(() => () => stopStream(), []);

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {camState === "idle" && photos.length === 0 && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50">
          <div className="flex items-center gap-3">
            <Camera size={22} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Take a photo of the issue</p>
              <p className="text-xs text-gray-400 mt-0.5">Up to {MAX_PHOTOS} photos — camera only</p>
            </div>
          </div>
          <button onClick={openCamera} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition">
            <Camera size={14} /> Open camera
          </button>
        </div>
      )}
      {camState === "active" && (
        <div className="bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-64 object-cover block" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900">
            <button onClick={switchCamera} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition" aria-label="Switch camera">
              <SwitchCamera size={20} />
              <span className="text-[10px]">Flip</span>
            </button>
            <button onClick={takePhoto} className="w-14 h-14 rounded-full bg-white border-4 border-gray-400 flex items-center justify-center hover:scale-95 transition" aria-label="Take photo">
              <Camera size={22} className="text-gray-800" />
            </button>
            <button onClick={closeCamera} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition" aria-label="Close camera">
              <X size={20} />
              <span className="text-[10px]">Close</span>
            </button>
          </div>
        </div>
      )}
      {camState === "error" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-700 flex-1">{camError}</span>
          <button onClick={openCamera} className="text-xs px-2.5 py-1 rounded-lg border border-red-300 bg-white text-red-600">Retry</button>
        </div>
      )}
      {photos.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{photos.length} photo{photos.length !== 1 ? "s" : ""} taken</span>
            {remaining > 0 ? (
              <span className="text-xs text-gray-400">{remaining} more allowed</span>
            ) : (
              <span className="text-xs text-orange-500 font-medium">Maximum reached</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {photos.map((src, i) => (
              <div key={i} className="relative w-[72px] h-[72px]">
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                <button onClick={() => deletePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" aria-label={`Delete photo ${i + 1}`}>
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {remaining > 0 && (
              <button onClick={openCamera} className="w-[72px] h-[72px] rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 transition" aria-label="Add more photos">
                <Plus size={20} />
                <span className="text-[10px]">Add more</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportForm() {
  const router = useRouter();
  const { profile } = useAuth();

  const handleCancel = () => {
    router.push("/reports");
  };

  const handleSuccess = () => {
    router.push("/reports");
  };

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [form, setForm] = useState({
    issueType:         "",
    severity:          "",
    description:       "",
    healthRisk:        false,
    affectedCount:     "",
    affectedChildren:  "",
    locationType:      "",
    community:         "",
    location:          "",
    phone:             "",
    isAnonymous:       false,
  });

  const [photos, setPhotos] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      if (error) {
        toast.error("Failed to load communities");
      } else {
        setCommunities(data || []);
      }
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
      if (error) {
        toast.error("Failed to load locations");
      } else {
        setLocations(data || []);
      }
      setLocationsLoading(false);
    }
    fetchLocations();
  }, [form.community, communities]);

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SR-${timestamp}-${random}`;
  };

  const uploadPhotos = async (referenceId) => {
    const urls = [];
    for (let i = 0; i < photos.length; i++) {
      try {
        const blob = await fetch(photos[i]).then((r) => r.blob());
        const path = `reports/${referenceId}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage
          .from("report-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (error) {
          console.warn("Photo upload skipped (storage not configured):", err.message);
          continue;
        }
        const { data } = supabase.storage.from("report-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      } catch (err) {
        console.warn("Photo upload skipped:", err.message);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!form.issueType)    return toast.error("Please select an issue type");
    if (!form.severity)     return toast.error("Please select a severity level");
    if (!form.phone)        return toast.error("Please enter a phone number");
    if (!form.community)    return toast.error("Please select a community");
    if (!form.locationType) return toast.error("Please select a location type");

    if (form.affectedChildren !== "" && parseInt(form.affectedChildren) < 0) {
      return toast.error("Affected children count cannot be negative");
    }

    setSubmitting(true);
    try {
      const referenceId = generateReferenceId();

      const community = communities.find((c) => c.name === form.community);
      const communityId = community?.id ?? null;

      const location = locations.find((l) => l.name === form.location);
      const locationId = location?.id ?? null;

      const uploadedUrls = await uploadPhotos(referenceId);

      const { error } = await supabase.from("sanitation_reports").insert({
        reference_id:           referenceId,
        issue_type:             form.issueType,
        severity:               form.severity,
        description:            form.description || null,
        health_risk:            form.healthRisk,
        reporter_phone:         form.phone,
        affected_people_count:  form.affectedCount ? parseInt(form.affectedCount) : null,
        affected_children_count: form.affectedChildren ? parseInt(form.affectedChildren) : null,
        location_type:          form.locationType,
        is_anonymous:           form.isAnonymous,
        status:                 "pending",
        community_id:           communityId,
        location_id:            locationId,
        reported_by:            profile?.id || null,
      });

      if (error) throw error;

      if (locationId && uploadedUrls.length > 0) {
        const imageRows = uploadedUrls.map((url) => ({
          location_id:  locationId,
          image_url:    url,
          image_type:   "report",
          uploaded_by:  profile?.id || null,
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

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Submit a report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Report a sanitation incident across Northern Ghana
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-0">

          <div>
            <SectionLabel icon={AlertTriangle}>Incident details</SectionLabel>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Issue type" required>
                <SelectInput
                  options={ISSUE_TYPES}
                  placeholder="Select issue…"
                  value={form.issueType}
                  onChange={set("issueType")}
                />
              </Field>
              <Field label="People affected">
                <input
                  type="number"
                  min="0"
                  value={form.affectedCount}
                  onChange={(e) => set("affectedCount")(e.target.value)}
                  placeholder="e.g. 50"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Children affected">
                <input
                  type="number"
                  min="0"
                  value={form.affectedChildren}
                  onChange={(e) => set("affectedChildren")(e.target.value)}
                  placeholder="e.g. 10"
                  className={inputCls}
                />
              </Field>
              <Field label="Location type" required>
                <SelectInput
                  options={LOCATION_TYPES}
                  placeholder="Select type…"
                  value={form.locationType}
                  onChange={set("locationType")}
                />
              </Field>
            </div>

            <div className="mb-3">
              <FieldLabel>Severity</FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY_OPTIONS.map(({ value, label, Icon, color }) => {
                  const active = form.severity === value;
                  const s = severityStyles[color];
                  return (
                    <button
                      key={value}
                      onClick={() => set("severity")(value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                        active ? s.active : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} className={active ? "" : "text-gray-400"} />
                      <span className="text-xs">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description")(e.target.value)}
                  placeholder="Describe what you observed, conditions on the ground, any immediate dangers…"
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </Field>
            </div>

            <ToggleRow
              icon={HeartCrack}
              iconColor="text-red-400"
              label="Health risk present?"
              badge="Health risk"
              badgeColor="bg-red-50 text-red-600"
              checked={form.healthRisk}
              onChange={set("healthRisk")}
            />
          </div>

          <Divider />

          <div>
            <SectionLabel icon={Camera}>Photo evidence</SectionLabel>
            <CameraSection photos={photos} setPhotos={setPhotos} />
          </div>

          <Divider />

          <div>
            <SectionLabel icon={MapPin}>Location</SectionLabel>

            <div className="mb-3">
              <GeoSection geoData={geoData} setGeoData={setGeoData} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Community" required>
                <SelectInput
                  options={communities}
                  placeholder={communitiesLoading ? "Loading communities…" : "Select community…"}
                  value={form.community}
                  onChange={set("community")}
                  disabled={communitiesLoading}
                />
              </Field>
              <Field label="Specific location">
                <SelectInput
                  options={locations}
                  placeholder={locationsLoading ? "Loading locations…" : form.community ? "Select location…" : "Select community first"}
                  value={form.location}
                  onChange={set("location")}
                  disabled={locationsLoading || !form.community}
                />
              </Field>
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel icon={User}>Reporter</SectionLabel>

            <div className="mb-3">
              <Field label="Phone number" required>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className={inputCls}
                />
              </Field>
            </div>

            <ToggleRow
              icon={EyeOff}
              iconColor="text-purple-400"
              label="Submit anonymously"
              badge="Anonymous"
              badgeColor="bg-purple-50 text-purple-600"
              checked={form.isAnonymous}
              onChange={set("isAnonymous")}
            />
          </div>

          <Divider />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Hash size={12} />
              Reference ID auto-generated on submit
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-brand-soft-highlight text-gray-900 disabled:opacity-60 transition"
              >
                <Send size={14} />
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
