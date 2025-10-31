"use client";

import { useEffect, useState } from "react";
import { dashboardApi, DashboardStats } from "@/lib/api/dashboardApi";
import { leaveApi } from "@/lib/api/leaveApi";
import {
  Users,
  Building2,
  IndianRupee,
  UserX,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceDays, setAttendanceDays] = useState(3);
  const [leaveDays, setLeaveDays] = useState(4);
  const [tableFilter, setTableFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(
    null
  );

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats({
        attendanceDays,
        leaveDays,
      });
      setStats(data);
    } catch (error: unknown) {
      console.error("Error fetching dashboard stats:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to fetch dashboard statistics"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [attendanceDays, leaveDays]);

  const handleLeaveCardClick = (
    type: "all" | "pending" | "approved" | "rejected"
  ) => {
    setTableFilter(type);
  };

  const handleLeaveAction = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setProcessingLeaveId(leaveId);

      await leaveApi.updateStatus(leaveId, { status });

      toast.success(`Leave request ${status.toLowerCase()} successfully!`);

      // Refresh the dashboard data
      await fetchStats();
    } catch (error: unknown) {
      console.error(`Error ${status.toLowerCase()} leave:`, error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ||
          `Failed to ${status.toLowerCase()} leave request`
      );
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const filteredRequests =
    stats?.pendingRequests.filter((req) => {
      if (tableFilter === "all") return true;
      return req.status.toLowerCase() === tableFilter;
    }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Monitor your team&apos;s activity and performance
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Active Employees */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Active Employees
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              {stats.kpis.totalActiveEmployees}
            </div>
          </div>

          {/* Total Departments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Departments
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              {stats.kpis.totalDepartments}
            </div>
          </div>

          {/* Total Monthly Payroll */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Monthly Payroll
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              ₹{Number(stats.kpis.totalMonthlyPayroll).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Row 2: Leave Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {/* Total Requests */}
          <div
            onClick={() => handleLeaveCardClick("all")}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 ${
              tableFilter === "all" ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Total Requests (This Quarter)
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.leaveSummary.totalRequests}
            </div>
          </div>

          {/* Approved */}
          <div
            onClick={() => handleLeaveCardClick("approved")}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 ${
              tableFilter === "approved"
                ? "border-green-500"
                : "border-gray-200"
            }`}
          >
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Approved (This Quarter)
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.leaveSummary.approved}
            </div>
          </div>

          {/* Rejected */}
          <div
            onClick={() => handleLeaveCardClick("rejected")}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 ${
              tableFilter === "rejected" ? "border-red-500" : "border-gray-200"
            }`}
          >
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Rejected (This Quarter)
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.leaveSummary.rejected}
            </div>
          </div>

          {/* Pending */}
          <div
            onClick={() => handleLeaveCardClick("pending")}
            className={`bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-5 shadow-sm border-2 border-amber-500 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 text-white`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-3">
              Pending Review
            </div>
            <div className="text-3xl font-bold">
              {stats.leaveSummary.pending}
            </div>
          </div>
        </div>

        {/* Row 3: Actionable Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Missing Attendance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                Missing Attendance
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <span>
                Show employees who have not marked attendance for more than
              </span>
              <input
                type="number"
                className="w-16 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={attendanceDays}
                onChange={(e) => setAttendanceDays(Number(e.target.value))}
                min="1"
                max="30"
              />
              <span>days</span>
            </div>
            <div className="space-y-2">
              {stats.insights.missingAttendance.employees.length > 0 ? (
                stats.insights.missingAttendance.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-3 border-blue-500"
                  >
                    {emp.displayText}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No employees with missing attendance
                </div>
              )}
            </div>
          </div>

          {/* Frequent Leave */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                Frequent Leave
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <span>Show employees who have applied for leave more than</span>
              <input
                type="number"
                className="w-16 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={leaveDays}
                onChange={(e) => setLeaveDays(Number(e.target.value))}
                min="1"
                max="20"
              />
              <span>times (last 6 months)</span>
            </div>
            <div className="space-y-2">
              {stats.insights.frequentLeave.employees.length > 0 ? (
                stats.insights.frequentLeave.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-3 border-blue-500"
                  >
                    {emp.displayText}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No employees with frequent leave
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Recent Leave Requests Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-5">
            <div className="text-xl font-bold text-gray-800">
              Recent Leave Requests
            </div>
            {tableFilter !== "all" && (
              <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">
                Filtered: {tableFilter.toUpperCase()}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-800">
                        {req.employeeName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {req.department}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {req.leaveType}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {req.dates}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            req.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : req.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {req.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() =>
                                  handleLeaveAction(req.id, "APPROVED")
                                }
                                disabled={processingLeaveId === req.id}
                                className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {processingLeaveId === req.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Approve"
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleLeaveAction(req.id, "REJECTED")
                                }
                                disabled={processingLeaveId === req.id}
                                className="px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {processingLeaveId === req.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Reject"
                                )}
                              </button>
                            </>
                          ) : (
                            <button className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300 transition-colors">
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
