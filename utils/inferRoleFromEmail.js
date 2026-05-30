export default function inferRoleFromEmail(email) {
  if (!email) return "community_officer";
  if (email.endsWith("@admin.com") || email.includes("admin")) return "admin";
  if (email.includes("district")) return "district_officer";
  if (email.includes("ngo")) return "ngo";
  if (email.includes("health")) return "health_officer";
  if (email.includes("supervisor")) return "supervisor";
  return "community_officer";
}
