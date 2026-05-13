import ProtectedRoute from "@/components/ProtectedRoute";

export default function NGOPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "ngo"]}>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            NGO Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to the NGO dashboard. Track and coordinate sanitation
            initiatives and impact metrics.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Projects Active
              </h3>
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500">Currently running</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                People Reached
              </h3>
              <p className="text-3xl font-bold text-blue-600">8,432</p>
              <p className="text-sm text-gray-500">Beneficiaries</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Impact Score
              </h3>
              <p className="text-3xl font-bold text-purple-600">87%</p>
              <p className="text-sm text-gray-500">Effectiveness rate</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
