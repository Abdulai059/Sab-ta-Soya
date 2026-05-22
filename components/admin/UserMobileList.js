import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import RoleSelect from "./RoleSelect";

export default function UserMobileList({ users, canChangeRoles, onRoleChange }) {
  return (
    <div className="sm:hidden space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.full_name || "—"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email || "—"}</p>
            </div>
            <div className="ml-auto shrink-0">
              <RoleBadge role={user.role} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {user.organization || "No org"}
            </span>
            {canChangeRoles ? (
              <RoleSelect
                value={user.role}
                onChange={(newRole) => onRoleChange(user.id, newRole)}
                size="xs"
              />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-12">No users found</p>
      )}
    </div>
  );
}
