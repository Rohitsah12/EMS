"use client";

import { useEffect, useState } from "react";
import {
  attendanceApi,
  EmployeeSummary,
  EmployeeAttendanceDetail,
  Attendance,
} from "@/lib/api/attendanceApi";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  UserCheck,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AttendancePage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSummary | null>(null);
  const [attendanceDetail, setAttendanceDetail] =
    useState<EmployeeAttendanceDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailPage, setDetailPage] = useState(1);

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters for detail view
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await attendanceApi.getSummary();
      setEmployees(data);
    } catch (error: unknown) {
      console.error("Error fetching employees:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to fetch attendance summary"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (employeeId: string) => {
    try {
      setIsLoadingDetail(true);
      const data = await attendanceApi.getEmployeeAttendance(employeeId, {
        page: detailPage,
        limit: 10,
        status: (statusFilter || undefined) as
          | "PRESENT"
          | "ABSENT"
          | "LATE"
          | "ON_LEAVE"
          | "HALF_DAY"
          | undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setAttendanceDetail(data);
    } catch (error: unknown) {
      console.error("Error fetching employee attendance:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to fetch attendance details"
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee && showDetailModal) {
      fetchEmployeeAttendance(selectedEmployee.id);
    }
  }, [
    selectedEmployee,
    showDetailModal,
    detailPage,
    statusFilter,
    startDate,
    endDate,
  ]);

  const openDetailModal = (employee: EmployeeSummary) => {
    setSelectedEmployee(employee);
    setDetailPage(1);
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
    setAttendanceDetail(null);
  };

  const openUpdateModal = (record: Attendance) => {
    setSelectedRecord(record);
    setUpdateStatus(record.status);
    setUpdateNotes(record.notes || "");
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedRecord(null);
    setUpdateStatus("");
    setUpdateNotes("");
  };

  const handleUpdateAttendance = async () => {
    if (!selectedRecord || !selectedEmployee) return;

    try {
      setIsUpdating(true);
      await attendanceApi.update(selectedRecord.id, {
        status: updateStatus as
          | "PRESENT"
          | "ABSENT"
          | "LATE"
          | "ON_LEAVE"
          | "HALF_DAY",
        notes: updateNotes || undefined,
      });

      toast.success("Attendance updated successfully");
      closeUpdateModal();
      fetchEmployeeAttendance(selectedEmployee.id);
      fetchEmployees(); // Refresh summary
    } catch (error: unknown) {
      console.error("Error updating attendance:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update attendance");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PRESENT: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
      LATE: "bg-yellow-100 text-yellow-800",
      ON_LEAVE: "bg-blue-100 text-blue-800",
      HALF_DAY: "bg-purple-100 text-purple-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PRESENT: <CheckCircle className="w-4 h-4" />,
      ABSENT: <XCircle className="w-4 h-4" />,
      LATE: <Clock className="w-4 h-4" />,
      ON_LEAVE: <CalendarDays className="w-4 h-4" />,
      HALF_DAY: <UserCheck className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || null;
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage >= 90)
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (percentage >= 70) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="text-3xl font-bold text-gray-800">
          Attendance Management
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Monitor and manage employee attendance records
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Employee Summary Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">
              Employee Attendance Summary
            </div>
            <div className="text-sm text-gray-600">
              Total Employees: {employees.length}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date of Joining
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Attendance %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-800">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.employeeId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {employee.department.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(employee.joinDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getPercentageIcon(employee.attendancePercentage)}
                        <span
                          className={`text-2xl font-bold ${getPercentageColor(
                            employee.attendancePercentage
                          )} px-3 py-1 rounded-lg`}
                        >
                          {employee.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Total Days:</span>
                          <span className="font-semibold text-gray-800">
                            {employee.totalDays}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Present:</span>
                          <span className="font-semibold text-green-600">
                            {employee.presentDays}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Absent:</span>
                          <span className="font-semibold text-red-600">
                            {employee.absentDays}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openDetailModal(employee)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedEmployee.name}&apos;s Attendance
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEmployee.employeeId} •{" "}
                  {selectedEmployee.department.name}
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Stats Banner */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Attendance Rate
                  </div>
                  <div
                    className={`text-3xl font-bold ${getPercentageColor(
                      selectedEmployee.attendancePercentage
                    )} inline-block px-4 py-2 rounded-lg`}
                  >
                    {selectedEmployee.attendancePercentage}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Total Days</div>
                  <div className="text-3xl font-bold text-gray-800">
                    {selectedEmployee.totalDays}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Present Days</div>
                  <div className="text-3xl font-bold text-green-600">
                    {selectedEmployee.presentDays}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Absent Days</div>
                  <div className="text-3xl font-bold text-red-600">
                    {selectedEmployee.absentDays}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setDetailPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDetailPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDetailPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : attendanceDetail && attendanceDetail.attendance.length > 0 ? (
                <div className="space-y-2">
                  {attendanceDetail.attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-sm font-medium text-gray-600 w-32">
                          {formatDate(record.date)}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status.replace("_", " ")}
                        </span>
                        <div className="text-sm text-gray-600 flex-1">
                          {record.notes || (
                            <span className="italic text-gray-400">
                              No notes
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openUpdateModal(record)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Update
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No attendance records found
                </div>
              )}
            </div>

            {/* Pagination */}
            {attendanceDetail && attendanceDetail.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {detailPage} of {attendanceDetail.pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDetailPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={detailPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setDetailPage((prev) =>
                        Math.min(
                          attendanceDetail.pagination.totalPages,
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      detailPage === attendanceDetail.pagination.totalPages
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRecord && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Update Attendance
              </h2>
              <button
                onClick={closeUpdateModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Date Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Date</div>
                <div className="text-lg font-bold text-gray-800">
                  {formatDate(selectedRecord.date)}
                </div>
              </div>

              {/* Status Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Add any notes or comments..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeUpdateModal}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAttendance}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Attendance"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
