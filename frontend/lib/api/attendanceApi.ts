import api from './axios';

export interface Attendance {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT'  | 'ON_LEAVE' | 'HALF_DAY';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSummary {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  joinDate: string;
  department: {
    id: string;
    name: string;
  };
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface EmployeeAttendanceDetail {
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    joinDate: string;
    department: {
      id: string;
      name: string;
    };
  };
  attendance: Attendance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetEmployeeAttendanceParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'HALF_DAY';
}

export interface UpdateAttendanceInput {
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'HALF_DAY';
  notes?: string;
}

export const attendanceApi = {
  // Get attendance summary for all employees
  getSummary: async (): Promise<EmployeeSummary[]> => {
    const response = await api.get('/attendance/summary');
    return response.data.data;
  },

  // Get detailed attendance for specific employee
  getEmployeeAttendance: async (
    employeeId: string,
    params?: GetEmployeeAttendanceParams
  ): Promise<EmployeeAttendanceDetail> => {
    const response = await api.get(`/attendance/employee/${employeeId}`, { params });
    return response.data.data;
  },

  // Update attendance record
  update: async (
    id: string,
    data: UpdateAttendanceInput
  ): Promise<Attendance> => {
    const response = await api.patch(`/attendance/${id}`, data);
    return response.data.data;
  },
};