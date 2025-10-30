export enum UserRole {
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  joinDate: string;
  designation: string;
  isActive: boolean;
  email: string;
  role: UserRole;
  personalEmail: string;
  phone: string;
  address: string;
  departmentId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    employee: Employee;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: unknown;
}