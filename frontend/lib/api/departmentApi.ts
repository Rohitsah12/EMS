import api from './axios';

export interface Department {
    id: string;
    name: string;
    managerId: string | null;
    manager: {
        id: string;
        name: string;
        employeeId: string;
    } | null;
    _count: {
        employees: number;
    };
    annualBudget: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DepartmentDetail extends Department {
    employees: Array<{
        id: string;
        employeeId: string;
        name: string;
        designation: string;
        email: string;
    }>;
}

export interface CreateDepartmentInput {
    name: string;
    managerId?: string | null;
    annualBudget?: number | null;
}

export interface UpdateDepartmentInput {
    name?: string;
    managerId?: string | null;
    annualBudget?: number | null;
}
export interface DepartmentsResponse {
  departments: Department[];
  totalBudget: number;
}

export const departmentApi = {
    getAll: async (): Promise<DepartmentsResponse> => {
        const response = await api.get('/departments');
        return response.data.data;
    },

  // Get department by ID
  getById: async (id: string): Promise<DepartmentDetail> => {
        const response = await api.get(`/departments/${id}`);
        return response.data.data;
    },

    // Create department
    create: async (data: CreateDepartmentInput): Promise<Department> => {
        const response = await api.post('/departments', data);
        return response.data.data;
    },

    // Update department
    update: async (id: string, data: UpdateDepartmentInput): Promise<Department> => {
        const response = await api.patch(`/departments/${id}`, data);
        return response.data.data;
    },

    // Delete department
    delete: async (id: string): Promise<void> => {
        await api.delete(`/departments/${id}`);
    },
};