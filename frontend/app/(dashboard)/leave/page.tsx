'use client';

import { useEffect, useState } from 'react';
import { leaveApi, Leave, LeaveStatistics } from '@/lib/api/leaveApi';
import { departmentApi, Department } from '@/lib/api/departmentApi';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [stats, setStats] = useState<LeaveStatistics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLeave, setActionLeave] = useState<Leave | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [remarks, setRemarks] = useState('');

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const data = await leaveApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        departmentId: departmentFilter || undefined,
      });
      setLeaves(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error: unknown) {
      console.error('Error fetching leaves:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await leaveApi.getStatistics(departmentFilter || undefined);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [currentPage, statusFilter, departmentFilter]);

  const openConfirmModal = (leave: Leave, type: 'APPROVED' | 'REJECTED') => {
    setActionLeave(leave);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setActionLeave(null);
    setActionType(null);
    setRemarks('');
  };

  const handleConfirmAction = async () => {
    if (!actionLeave || !actionType) return;

    try {
      setIsProcessing(actionLeave.id);
      await leaveApi.updateStatus(actionLeave.id, {
        status: actionType,
        remarks: remarks || undefined,
      });

      toast.success(
        `Leave request ${actionType.toLowerCase()} successfully`
      );

      closeConfirmModal();
      fetchLeaves();
      fetchStats();
    } catch (error: unknown) {
      console.error('Error updating leave status:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDepartmentFilter('');
    setCurrentPage(1);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="text-3xl font-bold text-gray-800">Leave Requests</div>
        <div className="text-sm text-gray-600 mt-1">
          Review and manage employee leave requests
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Total Requests</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">{stats.total}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Pending</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">{stats.pending}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Approved</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">{stats.approved}</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Rejected</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">{stats.rejected}</div>
            </div>
          </div>
        )}

        {/* Filters and Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          {/* Filter Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">All Leave Requests</div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED');
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions / Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{leave.employee.name}</div>
                        <div className="text-sm text-gray-500">{leave.employee.employeeId}</div>
                        <div className="text-xs text-gray-400">{leave.employee.email}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {leave.employee.department.name.toLocaleUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{leave.leaveType}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div>{formatDate(leave.startDate)}</div>
                        <div className="text-xs text-gray-500">to</div>
                        <div>{formatDate(leave.endDate)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {leave.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openConfirmModal(leave, 'APPROVED')}
                              disabled={isProcessing === leave.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                            >
                              {isProcessing === leave.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => openConfirmModal(leave, 'REJECTED')}
                              disabled={isProcessing === leave.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                            >
                              {isProcessing === leave.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm">
                            {leave.approvedBy && (
                              <>
                                <div className="font-medium text-gray-800">
                                  {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by:
                                </div>
                                <div className="text-gray-600">{leave.approvedBy.name}</div>
                                <div className="text-xs text-gray-500">
                                  {leave.approvedBy.employeeId}
                                </div>
                                {leave.actionAt && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {formatDateTime(leave.actionAt)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && actionLeave && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
              </h2>
              <button
                onClick={closeConfirmModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div
                  className={`p-4 rounded-lg ${
                    actionType === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="text-gray-800 mb-2">
                    Are you sure you want to <strong>{actionType.toLowerCase()}</strong> this
                    leave request?
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Employee:</strong> {actionLeave.employee.name}
                    </div>
                    <div>
                      <strong>Leave Type:</strong> {actionLeave.leaveType}
                    </div>
                    <div>
                      <strong>Duration:</strong> {formatDate(actionLeave.startDate)} to{' '}
                      {formatDate(actionLeave.endDate)}
                    </div>
                    <div>
                      <strong>Reason:</strong> {actionLeave.reason}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Add any remarks or comments..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={!!isProcessing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={!!isProcessing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${
                    actionType === 'APPROVED'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
                    </>
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