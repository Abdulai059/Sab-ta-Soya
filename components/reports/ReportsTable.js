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
              {COLUMNS.map((col) => (
                <th key={col} className={TH}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-12 text-center text-gray-500">
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