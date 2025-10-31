import api from './axios';

export interface Leave {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  actionAt: string | null;
  approvedById: string | null;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    department: {
      id: string;
      name: string;
    };
  };
  approvedBy: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
  } | null;
}

export interface LeaveStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface LeavesResponse {
  data: Leave[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetLeavesParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  departmentId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateLeaveStatusInput {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export const leaveApi = {
  // Get all leaves with filters
  getAll: async (params?: GetLeavesParams): Promise<LeavesResponse> => {
    const response = await api.get('/leaves', { params });
    return response.data.data;
  },

  // Get leave statistics
  getStatistics: async (departmentId?: string): Promise<LeaveStatistics> => {
    const response = await api.get('/leaves/statistics', {
      params: departmentId ? { departmentId } : {},
    });
    return response.data.data;
  },

  // Update leave status (approve/reject)
  updateStatus: async (
    id: string,
    data: UpdateLeaveStatusInput
  ): Promise<Leave> => {
    const response = await api.patch(`/leaves/${id}/status`, data);
    return response.data.data;
  },
};