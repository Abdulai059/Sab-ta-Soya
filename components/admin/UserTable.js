import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import RoleSelect from "./RoleSelect";

const TABLE_HEADINGS = ["User", "Email", "Organization", "Role", "Change Role"];

export default function UserTable({ users, canChangeRoles, onRoleChange }) {
  return (
    <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEADINGS.map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {user.full_name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {user.email || "—"}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {user.organization || "—"}
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-4">
                  {canChangeRoles ? (
                    <RoleSelect
                      value={user.role}
                      onChange={(newRole) => onRoleChange(user.id, newRole)}
                      size="sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="px-5 py-12 text-center text-gray-400 text-sm">
          No users found
        </p>
      )}
    </div>
  );
}
