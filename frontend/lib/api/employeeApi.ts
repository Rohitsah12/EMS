import api from './axios';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  isActive: boolean;
  joinDate: string;
  department: {
    id: string;
    name: string;
  };
}

export interface EmployeesResponse {
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
}

export const employeeApi = {
  // Get all employees with filters
  getAll: async (params?: GetEmployeesParams): Promise<EmployeesResponse> => {
    const response = await api.get('/employees', { params });
    return response.data.data;
  },

  // Search employees (for manager selection)
  search: async (search: string): Promise<Employee[]> => {
    const response = await api.get('/employees', {
      params: { search, isActive: true, limit: 10 },
    });
    return response.data.data.data;
  },
};