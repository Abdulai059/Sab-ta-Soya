export default function UserAvatar({ user, size = "sm" }) {
  const initial = (user.full_name || user.email || "?").charAt(0);
  const sizeClasses =
    size === "sm"
      ? "w-8 h-8 rounded-lg text-xs"
      : "w-9 h-9 rounded-xl text-sm";

  // If user has an avatar URL, display the image
  if (user.avatar_url) {
    return (
      <div className={`${sizeClasses} overflow-hidden shrink-0`}>
        <img
          src={user.avatar_url}
          alt={user.full_name || user.email}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise, show initials
  return (
    <div
      className={`${sizeClasses} bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0`}
    >
      <span className="text-white font-bold uppercase">{initial}</span>
    </div>
  );
}
