import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function DistrictOfficerPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "district_officer"]}>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            District Officer Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to the District Officer dashboard. Monitor and manage
            sanitation activities across your district.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Reports
              </h3>
              <p className="text-3xl font-bold text-blue-600">156</p>
              <p className="text-sm text-gray-500">All time</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Active Cases
              </h3>
              <p className="text-3xl font-bold text-orange-600">23</p>
              <p className="text-sm text-gray-500">Currently ongoing</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Response Rate
              </h3>
              <p className="text-3xl font-bold text-green-600">94%</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Coverage
              </h3>
              <p className="text-3xl font-bold text-purple-600">78%</p>
              <p className="text-sm text-gray-500">District covered</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
