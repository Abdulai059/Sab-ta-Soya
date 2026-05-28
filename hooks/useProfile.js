import { useState } from "react";
import toast from "react-hot-toast";
import { uploadAvatar, updateProfile, saveAvatarUrl } from "@/lib/apiProfile";
import { useAuth } from "@/context/AuthContext";

/**
 * Thin React wrapper around apiProfile service.
 * Splits avatar upload and profile update into two explicit steps.
 */
export function useProfile() {
  const { refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function saveProfile(userId, profileData, avatarFile = null) {
    setIsUpdating(true);
    setUploadProgress(10);

    try {
      // Step 1: Upload avatar and write URL to DB
      if (avatarFile) {
        setUploadProgress(30);
        const publicUrl = await uploadAvatar({ userId, avatarFile });
        setUploadProgress(60);
        await saveAvatarUrl({ userId, publicUrl });
        setUploadProgress(80);
      }

      // Step 2: Update profile text fields
      await updateProfile({ userId, ...profileData });
      setUploadProgress(90);

      // Step 3: Refresh auth context so UI reflects new data
      await refreshProfile();
      setUploadProgress(100);

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      return { success: false, error };
    } finally {
      setIsUpdating(false);
      setUploadProgress(0);
    }
  }

  return { saveProfile, isUpdating, uploadProgress };
}
