"use client";

import { MapPin, AlertTriangle, Camera, User, HeartCrack, EyeOff, Hash, Send } from "lucide-react";
import useReportForm from "@/hooks/useReportForm";
import { ISSUE_TYPES, SEVERITY_OPTIONS, severityStyles, LOCATION_TYPES } from "@/data/reportConstants";
import { SectionLabel, Field, SelectInput, ToggleRow, Divider, inputCls } from "@/components/report/FormPrimitives";
import GeoSection from "@/components/report/GeoSection";
import CameraSection from "@/components/report/CameraSection";

export default function ReportIssuePage() {
  const {
    form, set, photos, setPhotos, geoData, setGeoData,
    submitting, communities, communitiesLoading,
    locations, locationsLoading,
    handleSubmit, handleCancel,
  } = useReportForm();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Submit a report</h1>
          <p className="text-sm text-gray-500 mt-1">Report a sanitation incident across Northern Ghana</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-0">

          <div>
            <SectionLabel icon={AlertTriangle}>Incident details</SectionLabel>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Issue type" required>
                <SelectInput options={ISSUE_TYPES} placeholder="Select issue…" value={form.issueType} onChange={set("issueType")} />
              </Field>
              <Field label="People affected">
                <input type="number" min="0" value={form.affectedCount} onChange={(e) => set("affectedCount")(e.target.value)} placeholder="e.g. 50" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Children affected">
                <input type="number" min="0" value={form.affectedChildren} onChange={(e) => set("affectedChildren")(e.target.value)} placeholder="e.g. 10" className={inputCls} />
              </Field>
              <Field label="Location type" required>
                <SelectInput options={LOCATION_TYPES} placeholder="Select type…" value={form.locationType} onChange={set("locationType")} />
              </Field>
            </div>

            <div className="mb-3">
              <label className="text-[13px] text-gray-500 mb-1 block">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY_OPTIONS.map(({ value, label, Icon, color }) => {
                  const active = form.severity === value;
                  const s = severityStyles[color];
                  return (
                    <button
                      key={value}
                      onClick={() => set("severity")(value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-sm font-medium transition ${active ? s.active : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
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
                <textarea value={form.description} onChange={(e) => set("description")(e.target.value)} placeholder="Describe what you observed, conditions on the ground, any immediate dangers…" rows={3} className={inputCls + " resize-none"} />
              </Field>
            </div>

            <ToggleRow icon={HeartCrack} iconColor="text-red-400" label="Health risk present?" badge="Health risk" badgeColor="bg-red-50 text-red-600" checked={form.healthRisk} onChange={set("healthRisk")} />
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
                <SelectInput options={communities} placeholder={communitiesLoading ? "Loading communities…" : "Select community…"} value={form.community} onChange={set("community")} disabled={communitiesLoading} />
              </Field>
              <Field label="Specific location">
                <SelectInput options={locations} placeholder={locationsLoading ? "Loading locations…" : form.community ? "Select location…" : "Select community first"} value={form.location} onChange={set("location")} disabled={locationsLoading || !form.community} />
              </Field>
            </div>
          </div>

          <Divider />

          <div>
            <SectionLabel icon={User}>Reporter</SectionLabel>
            <div className="mb-3">
              <Field label="Phone number" required>
                <input type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+233 XX XXX XXXX" className={inputCls} />
              </Field>
            </div>
            <ToggleRow icon={EyeOff} iconColor="text-purple-400" label="Submit anonymously" badge="Anonymous" badgeColor="bg-purple-50 text-purple-600" checked={form.isAnonymous} onChange={set("isAnonymous")} />
          </div>

          <Divider />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Hash size={12} />
              Reference ID auto-generated on submit
            </span>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-brand-soft-highlight text-gray-900 disabled:opacity-60 transition">
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
