import api from './axios';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  isActive: boolean;
  joinDate: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  role: string;
  department: {
    id: string;
    name: string;
  };
}

export interface EmployeeDetail extends Employee {
  createdAt: string;
  updatedAt: string;
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

export interface RegisterEmployeeInput {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  designation: string;
  departmentId: string;
  personalEmail: string;
  phone: string;
  address: string;
  role?: 'HR' | 'EMPLOYEE';
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  designation?: string;
  departmentId?: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  role?: 'HR' | 'EMPLOYEE';
  isActive?: boolean;
}

export interface Salary {
  id: string;
  employeeId: string;
  baseSalary: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

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
  approvedBy: {
    id: string;
    name: string;
    employeeId: string;
  } | null;
}

export const employeeApi = {
  // Get all employees with filters
  getAll: async (params?: GetEmployeesParams): Promise<EmployeesResponse> => {
    const response = await api.get('/employees', { params });
    return response.data.data;
  },

  // Get single employee details
  getById: async (id: string): Promise<EmployeeDetail> => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  // Register new employee
  register: async (data: RegisterEmployeeInput): Promise<Employee> => {
    const response = await api.post('/auth/register', data);
    return response.data.data.employee;
  },

  // Update employee
  update: async (id: string, data: UpdateEmployeeInput): Promise<Employee> => {
    const response = await api.patch(`/employees/${id}`, data);
    return response.data.data;
  },

  // Deactivate employee
  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Search employees (for autocomplete)
  search: async (search: string): Promise<Employee[]> => {
    const response = await api.get('/employees', {
      params: { search, isActive: true, limit: 50 },
    });
    return response.data.data.data;
  },

  // Get employee salary history
  getSalaryHistory: async (employeeId: string): Promise<Salary[]> => {
    const response = await api.get(`/salaries/employee/${employeeId}`);
    return response.data.data;
  },

  // Get employee leave history
  getLeaveHistory: async (employeeId: string): Promise<Leave[]> => {
    const response = await api.get(`/employees/${employeeId}/leaves`);
    return response.data.data;
  },

  // Create salary record
  createSalary: async (data: {
    employeeId: string;
    baseSalary: number;
    effectiveDate: string;
  }): Promise<Salary> => {
    const response = await api.post('/salaries', data);
    return response.data.data;
  },

  // Update salary record
  updateSalary: async (
    id: string,
    data: { baseSalary?: number; effectiveDate?: string }
  ): Promise<Salary> => {
    const response = await api.patch(`/salaries/${id}`, data);
    return response.data.data;
  },

  // Delete salary record
  deleteSalary: async (id: string): Promise<void> => {
    await api.delete(`/salaries/${id}`);
  },
};