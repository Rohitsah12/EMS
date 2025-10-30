import api from './axios';

export interface DashboardStats {
  kpis: {
    totalActiveEmployees: number;
    totalDepartments: number;
    totalMonthlyPayroll: string;
  };
  leaveSummary: {
    quarter: {
      number: number;
      startDate: string;
      endDate: string;
    };
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  insights: {
    missingAttendance: {
      threshold: number;
      employees: Array<{
        id: string;
        name: string;
        department: string;
        displayText: string;
      }>;
    };
    frequentLeave: {
      threshold: number;
      period: string;
      employees: Array<{
        id: string;
        name: string;
        department: string;
        leaveCount: number;
        displayText: string;
      }>;
    };
  };
  pendingRequests: Array<{
    id: string;
    employeeName: string;
    employeeId: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    dates: string;
    reason: string;
    status: string;
    requestedAt: string;
  }>;
}

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (params?: {
    attendanceDays?: number;
    leaveDays?: number;
  }): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats', { params });
    return response.data.data;
  },
};