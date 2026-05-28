import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ROLE_METADATA } from "@/lib/permissions";

export function useProfileForm() {
  const { profile, user } = useAuth();
  const { saveProfile, isUpdating, uploadProgress } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const buildFormData = () => ({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    organization: profile?.organization || "",
  });

  const [formData, setFormData] = useState(buildFormData);

  useEffect(() => {
    if (!isEditing) setFormData(buildFormData());
  }, [profile, isEditing]);

  const roleMeta = ROLE_METADATA[profile?.role] || {
    label: profile?.role || "User",
    color: "bg-gray-100 text-gray-700",
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    if (!isEditing) setIsEditing(true);
  };

  const handleSave = async () => {
    const result = await saveProfile(user.id, formData, selectedFile);
    if (result.success) {
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setFormData(buildFormData());
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  return {
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
  };
}