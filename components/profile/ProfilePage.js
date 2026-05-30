"use client";

import { useProfileForm } from "@/hooks/useProfileForm";
import { User, Mail, Phone, Building2, Shield, Calendar, Camera, Save, X } from "lucide-react";

const FIELDS = [
  { icon: User,      label: "Full Name",    name: "full_name",    type: "text",  placeholder: "Enter your full name" },
  { icon: Mail,      label: "Email",        name: "email",        type: "email", placeholder: "Enter your email" },
  { icon: Phone,     label: "Phone Number", name: "phone",        type: "tel",   placeholder: "Enter your phone number" },
  { icon: Building2, label: "Organization", name: "organization", type: "text",  placeholder: "Enter your organization" },
];

export default function ProfilePage() {
  const {
    profile,
    formData,
    isEditing,
    isUpdating,
    uploadProgress,
    selectedFile,
    previewUrl,
    roleMeta,
    getInitials,
    setIsEditing,
    handleInputChange,
    handleFileSelect,
    handleSave,
    handleCancel,
  } = useProfileForm();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-brand-primary" />

        <div className="px-6 pb-6">
          {/* Avatar & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-white overflow-hidden">
                {previewUrl || profile?.avatar_url ? (
                  <img
                    src={previewUrl || profile.avatar_url}
                    alt={profile?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{getInitials(profile?.full_name)}</span>
                  </div>
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
              >
                <Camera className="w-5 h-5" />
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              {selectedFile && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <Camera className="w-3 h-3" /> New image selected
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand-soft-highlight hover:bg-brand-soft-highlight text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-brand-soft-highlight hover:bg-brand-soft-highlight text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>

                  {isUpdating && uploadProgress > 0 && (
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-6">
            {FIELDS.map(({ icon: Icon, label, name, type, placeholder }) => (
              <div key={name}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" /> {label}
                </label>
                {isEditing ? (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-2.5 bg-gray-50 rounded-lg">
                    {profile?.[name] || "Not set"}
                  </p>
                )}
              </div>
            ))}

            {/* Role — read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 text-gray-400" /> Role
              </label>
              <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
              </div>
            </div>

            {/* Member Since — read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Member Since
              </label>
              <p className="text-gray-900 px-4 py-2.5 bg-gray-50 rounded-lg">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}