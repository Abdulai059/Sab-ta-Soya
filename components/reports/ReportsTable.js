import ReportTableRow from "./ReportTableRow";

const COLUMNS = [
  "Ref ID", "Issue / Location", "Severity", "Risk Score",
  "Status", "Assigned To", "Reported", "Location", "Actions",
];

const TH = "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider";

export default function ReportsTable({ reports, profile, formatTimeAgo }) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-light-green border-b border-gray-200">
            <tr>
<<<<<<< HEAD
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ref ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Issue / Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reported
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
=======
              {COLUMNS.map((col) => (
                <th key={col} className={TH}>{col}</th>
              ))}
>>>>>>> feature/update
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
<<<<<<< HEAD
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
=======
                <td colSpan={COLUMNS.length} className="px-6 py-12 text-center text-gray-500">
>>>>>>> feature/update
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <ReportTableRow key={report.id} report={report} profile={profile} formatTimeAgo={formatTimeAgo} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}