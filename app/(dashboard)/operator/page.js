import ProtectedRoute from "@/components/ProtectedRoute";

export default function OperatorPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "operator"]}>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Operator Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to the Operator dashboard. Here you can manage sanitation
            incidents and reports.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Incident Reports
              </h3>
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pending Actions
              </h3>
              <p className="text-3xl font-bold text-yellow-600">8</p>
              <p className="text-sm text-gray-500">Require attention</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resolved Today
              </h3>
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500">Successfully completed</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
