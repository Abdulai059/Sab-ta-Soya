import { CheckCircle } from "lucide-react";

export default function AssignmentsList({ assignments }) {
  if (!assignments || assignments.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h2>
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {assignment.assigned_to_profile?.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  {assignment.assigned_to_profile?.role}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>
                  Assigned{" "}
                  {new Date(assignment.assigned_at).toLocaleDateString()}
                </p>
                {assignment.assigned_by_profile && (
                  <p className="text-xs text-gray-500">
                    by {assignment.assigned_by_profile.full_name}
                  </p>
                )}
              </div>
            </div>
            {assignment.notes && (
              <p className="text-sm text-gray-700 mt-2">{assignment.notes}</p>
            )}
            {assignment.resolved_at && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Resolved on{" "}
                {new Date(assignment.resolved_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
