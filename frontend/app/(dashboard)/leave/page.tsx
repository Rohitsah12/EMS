export default function LeavePage() {
  return (
    <div className="min-h-screen">
      <div className="dashboard-header bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="dashboard-title text-3xl font-bold text-gray-800">Leave Requests Management</div>
        <div className="dashboard-subtitle text-sm text-gray-600 mt-1">
          Review and manage employee leave requests
        </div>
      </div>

      <div className="dashboard-content p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            This is the Leave Requests Page
          </h2>
          <p className="text-gray-600">
            Leave request list and approval workflow will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}