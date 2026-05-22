import { CheckCircle, Clock, UserCheck, Loader, ShieldCheck, User } from "lucide-react";

// Task progress step config
const TASK_STEPS = [
  {
    key: "assigned",
    label: "Offer sent",
    desc: (a) => `Assigned by ${a.assigned_by_profile?.full_name ?? "admin"}`,
    time: (a) => a.assigned_at,
    icon: UserCheck,
    color: "text-blue-600",
    bg: "bg-blue-100",
    dot: "bg-blue-500",
  },
  {
    key: "in_progress",
    label: "Worker accepted",
    desc: () => "Task is now in progress",
    time: (a) => a.service_tasks?.[0]?.started_at,
    icon: Loader,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    dot: "bg-indigo-500",
  },
  {
    key: "completed",
    label: "Task completed",
    desc: () => "Issue resolved",
    time: (a) => a.service_tasks?.[0]?.completed_at,
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    dot: "bg-emerald-500",
  },
];

function fmt(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TaskTimeline({ assignment }) {
  const task = assignment.service_tasks?.[0];
  const taskStatus = task?.status ?? "pending";

  // Which steps are reached
  const reached = (key) => {
    if (key === "assigned")    return true;
    if (key === "in_progress") return ["in_progress", "completed"].includes(taskStatus);
    if (key === "completed")   return taskStatus === "completed";
    return false;
  };

  return (
    <div className="mt-4 space-y-0">
      {TASK_STEPS.map((step, i) => {
        const done = reached(step.key);
        const Icon = step.icon;
        const isLast = i === TASK_STEPS.length - 1;
        const time = fmt(step.time(assignment));

        return (
          <div key={step.key} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                done ? step.bg : "bg-gray-100"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${done ? step.color : "text-gray-300"}`} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${done ? "bg-gray-300" : "bg-gray-100"}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 min-w-0 ${isLast ? "" : ""}`}>
              <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-300"}`}>
                {step.label}
              </p>
              {done && (
                <>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc(assignment)}</p>
                  {time && (
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                  )}
                </>
              )}
              {!done && (
                <p className="text-xs text-gray-300 mt-0.5">Waiting…</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AssignmentsList({ assignments }) {
  if (!assignments || assignments.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Assignment & Progress</h2>
      <p className="text-xs text-gray-400 mb-5">Track who is handling this report and where they are in the workflow</p>

      <div className="space-y-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">

            {/* Worker info */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {(assignment.assigned_to_profile?.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {assignment.assigned_to_profile?.full_name ?? "Unknown worker"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {assignment.assigned_to_profile?.role?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Assigned by */}
              {assignment.assigned_by_profile && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400">Assigned by</p>
                  <p className="text-xs font-medium text-gray-600">
                    {assignment.assigned_by_profile.full_name}
                  </p>
                </div>
              )}
            </div>

            {/* Admin notes */}
            {assignment.notes && (
              <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 mt-3 mb-1">
                📝 {assignment.notes}
              </p>
            )}

            {/* Task progress timeline */}
            <TaskTimeline assignment={assignment} />

            {/* Resolved timestamp */}
            {assignment.resolved_at && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Resolved on {fmt(assignment.resolved_at)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
