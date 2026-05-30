import { supabase } from "./supabase";

const BUCKET = "profile-images";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// Uploads avatar to storage and returns the public URL.
// Does not persist to the database — caller is responsible for that.
export async function uploadAvatar({ userId, avatarFile }) {
  if (!avatarFile.type.startsWith("image/"))
    throw new Error("File must be an image (jpg, png, webp…)");

  if (avatarFile.size > 2 * 1024 * 1024)
    throw new Error("Image must be smaller than 2 MB");

  const ext      = avatarFile.name.split(".").pop();
  const fileName = `avatar-${userId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, avatarFile, { cacheControl: "3600", upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

// Updates editable profile fields only.
// role, community_id, and created_at are intentionally excluded.
export async function updateProfile({ userId, full_name, email, phone, organization, avatar_url }) {
  const payload = {};
  if (full_name    !== undefined) payload.full_name    = full_name;
  if (email        !== undefined) payload.email        = email;
  if (phone        !== undefined) payload.phone        = phone;
  if (organization !== undefined) payload.organization = organization;
  if (avatar_url   !== undefined) payload.avatar_url   = avatar_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select();

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

// Writes a storage public URL directly to profiles.avatar_url.
export async function saveAvatarUrl({ userId, publicUrl }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId)
    .select();

  if (error) throw new Error(error.message);

  if (!data?.length)
    throw new Error("Profile update blocked — check RLS policies on the profiles table.");

  return data[0];
}

// Combined operation: uploads avatar if provided, then updates the profile row.
export async function updateProfileWithAvatar({ userId, profileData, avatarFile }) {
  const avatar_url = avatarFile
    ? await uploadAvatar({ userId, avatarFile })
    : profileData.avatar_url ?? undefined;

  return updateProfile({
    userId,
    ...profileData,
    ...(avatar_url !== undefined && { avatar_url }),
  });
}