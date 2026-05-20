import { Cloud } from "lucide-react";

export default function ClimateEventBanner({ climateEvent }) {
  if (!climateEvent) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Cloud className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Climate Event Linked</h3>
      </div>
      <p className="text-sm text-gray-700">
        <span className="font-medium">{climateEvent.event_type}</span> -{" "}
        {climateEvent.severity} severity
      </p>
      {climateEvent.impact_notes && (
        <p className="text-sm text-gray-600 mt-1">{climateEvent.impact_notes}</p>
      )}
    </div>
  );
}
