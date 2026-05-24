"use client";

import { Bell, Wrench, Trash2, ShieldCheck, Clock, Check } from "lucide-react";

// Workflow: pending → assigned → in_progress → disposed → verified
const WORKFLOW_STAGES = [
  { id: "assigned",    label: "Assigned",    icon: Bell,        description: "Worker assigned to task" },
  { id: "in_progress", label: "In Progress", icon: Wrench,      description: "Active work on site" },
  { id: "disposed",    label: "Disposed",    icon: Trash2,      description: "Waste disposed" },
  { id: "verified",    label: "Verified",    icon: ShieldCheck, description: "Task verified & closed" },
];

function getCurrentStageIndex(status) {
  if (status === "assigned")    return 0;
  if (status === "in_progress") return 1;
  if (status === "disposed")    return 2;
  if (status === "verified")    return 3;
  return -1;
}

function WorkflowStage({ stage, isActive, isCompleted, isLast }) {
  const Icon = stage.icon;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <div className={`
          w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300
          ${isCompleted ? "bg-emerald-500 border-emerald-500"
            : isActive  ? "bg-blue-500 border-blue-500"
            : "bg-white border-gray-200"}
        `}>
          {isCompleted
            ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            : <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-300"}`} />}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 my-1.5" style={{ minHeight: 36 }}>
            <div className={`w-full h-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-gray-100"}`} />
          </div>
        )}
      </div>

      <div className={`flex-1 ${!isLast ? "pb-5" : "pb-0"}`}>
        <div className={`px-3 py-2.5 rounded-xl border transition-all duration-300 ${
          isActive      ? "bg-blue-50 border-blue-200"
          : isCompleted ? "bg-emerald-50 border-emerald-100"
          : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}>
              {stage.label}
            </p>
            {isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-semibold">Current</span>
            )}
            {isCompleted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">Done</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{stage.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowRoadmap({ report }) {
  const status = report?.status?.toLowerCase();
  const currentStageIndex = getCurrentStageIndex(status);
  const progressPercentage = currentStageIndex >= 0
    ? Math.round(((currentStageIndex + 1) / WORKFLOW_STAGES.length) * 100)
    : 0;

  const worker = report?.worker;

  if (!report?.assigned_to) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Workflow Progress</h2>
          <p className="text-xs text-gray-400 mt-0.5">Track the sanitation work lifecycle</p>
        </div>
        <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No Active Assignment</p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            The workflow tracker will appear once a worker has been assigned to this report
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Header + progress bar */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Workflow Progress</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Step {Math.max(currentStageIndex + 1, 1)} of {WORKFLOW_STAGES.length} · {progressPercentage}% complete
            </p>
          </div>
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
            status === "verified"      ? "bg-emerald-100 text-emerald-700"
            : status === "disposed"    ? "bg-orange-100 text-orange-700"
            : status === "in_progress" ? "bg-blue-100 text-blue-700"
            : "bg-yellow-100 text-yellow-700"
          }`}>
            {status?.replace(/_/g, " ")}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Worker info */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
          {worker?.full_name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {worker?.full_name || "Unknown Worker"}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {worker?.role?.replace(/_/g, " ") || "Worker"}
          </p>
        </div>
      </div>

      {/* Stages */}
      <div className="p-5">
        {WORKFLOW_STAGES.map((stage, index) => (
          <WorkflowStage
            key={stage.id}
            stage={stage}
            isActive={index === currentStageIndex}
            isCompleted={index < currentStageIndex}
            isLast={index === WORKFLOW_STAGES.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
