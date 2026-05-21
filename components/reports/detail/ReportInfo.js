import {
  MapPin,
  Calendar,
  User,
  Phone,
  Users,
  FileText,
  Navigation,
} from "lucide-react";
import { navigateTo } from "@/utils/navigateTo";

export default function ReportInfo({ report }) {
  return (
    <>
      {report.description && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <p className="text-gray-600">{report.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium text-gray-900">
              {report.location?.name || "N/A"}
            </p>
            {report.location?.area_name && (
              <p className="text-sm text-gray-500">{report.location.area_name}</p>
            )}
            {report.location?.latitude && report.location?.longitude && (
              <button
                onClick={() => navigateTo(report.location.latitude, report.location.longitude)}
                className="mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                title="Get directions in Google Maps"
              >
                <Navigation className="w-3 h-3" />
                Open in Maps
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Community</p>
            <p className="font-medium text-gray-900">{report.community?.name}</p>
            <p className="text-sm text-gray-500">
              {report.community?.district}, {report.community?.region}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Reported</p>
            <p className="font-medium text-gray-900">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {report.affected_people_count && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Affected People</p>
              <p className="font-medium text-gray-900">
                {report.affected_people_count}
              </p>
            </div>
          </div>
        )}

        {!report.is_anonymous && report.reported_by_profile && (
          <>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Reported By</p>
                <p className="font-medium text-gray-900">
                  {report.reported_by_profile.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {report.reported_by_profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium text-gray-900">{report.reporter_phone}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
