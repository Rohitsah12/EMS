"use client";

import { useEffect, useState } from "react";
import {
  employeeApi,
  Employee,
  Salary,
  Leave,
  RegisterEmployeeInput,
  UpdateEmployeeInput,
} from "@/lib/api/employeeApi";
import { departmentApi, Department } from "@/lib/api/departmentApi";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  UserX,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  UserCheck,
  Filter,
  Calendar,
  DollarSign,
  Trash2,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeSalaries, setEmployeeSalaries] = useState<Salary[]>([]);
  const [employeeLeaves, setEmployeeLeaves] = useState<Leave[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Add/Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Salary Management
  const [showAddSalaryModal, setShowAddSalaryModal] = useState(false);
  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: "",
    effectiveDate: "",
  });

  // Confirmation Modals
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteSalaryConfirm, setShowDeleteSalaryConfirm] = useState(false);
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null);

  // Form states for add
  const [addForm, setAddForm] = useState<
    RegisterEmployeeInput & { baseSalary?: string }
  >({
    name: "",
    email: "",
    password: "Password@123",
    dateOfBirth: "",
    maritalStatus: "SINGLE",
    designation: "",
    departmentId: "",
    personalEmail: "",
    phone: "",
    address: "",
    role: "EMPLOYEE",
    baseSalary: "",
  });

  // Form states for edit
  const [editForm, setEditForm] = useState<UpdateEmployeeInput>({});

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        departmentId: departmentFilter || undefined,
        isActive: statusFilter,
      });
      setEmployees(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error: unknown) {
      console.error("Error fetching employees:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchQuery, departmentFilter, statusFilter]);

  const openDetailModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
    setIsLoadingDetails(true);

    try {
      const [salaries, leaves] = await Promise.all([
        employeeApi.getSalaryHistory(employee.id),
        employeeApi.getLeaveHistory(employee.id),
      ]);
      setEmployeeSalaries(salaries);
      setEmployeeLeaves(leaves);
    } catch (error) {
      console.error("Error loading employee details:", error);
      toast.error("Failed to load complete employee details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
    setEmployeeSalaries([]);
    setEmployeeLeaves([]);
  };

  const openAddModal = () => {
    setAddForm({
      name: "",
      email: "",
      password: "Password@123",
      dateOfBirth: "",
      maritalStatus: "SINGLE",
      designation: "",
      departmentId: "",
      personalEmail: "",
      phone: "",
      address: "",
      role: "EMPLOYEE",
      baseSalary: "",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditForm({
      name: employee.name,
      email: employee.email,
      dateOfBirth: employee.dateOfBirth,
      maritalStatus: employee.maritalStatus as
        | "SINGLE"
        | "MARRIED"
        | "DIVORCED"
        | "WIDOWED",
      designation: employee.designation,
      departmentId: employee.department.id,
      personalEmail: employee.personalEmail,
      phone: employee.phone,
      address: employee.address,
      role: employee.role as "EMPLOYEE" | "HR",
      isActive: employee.isActive,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    setEditForm({});
  };

  const openAddSalaryModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSalaryForm({
      baseSalary: "",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    setShowAddSalaryModal(true);
  };

  const closeAddSalaryModal = () => {
    setShowAddSalaryModal(false);
    setSelectedEmployee(null);
    setSalaryForm({ baseSalary: "", effectiveDate: "" });
  };

  const openEditSalaryModal = (salary: Salary) => {
    setSelectedSalary(salary);
    setSalaryForm({
      baseSalary: salary.baseSalary.toString(),
      effectiveDate: salary.effectiveDate.split("T")[0],
    });
    setShowEditSalaryModal(true);
  };

  const closeEditSalaryModal = () => {
    setShowEditSalaryModal(false);
    setSelectedSalary(null);
    setSalaryForm({ baseSalary: "", effectiveDate: "" });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const { baseSalary, ...employeeData } = addForm;

      // Register employee
      const newEmployee = await employeeApi.register(employeeData);

      // Add salary if provided
      if (baseSalary && parseFloat(baseSalary) > 0) {
        await employeeApi.createSalary({
          employeeId: newEmployee.id,
          baseSalary: parseFloat(baseSalary),
          effectiveDate: newEmployee.joinDate,
        });
      }

      toast.success("Employee registered successfully");
      closeAddModal();
      fetchEmployees();
    } catch (error: unknown) {
      console.error("Error adding employee:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to register employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      await employeeApi.update(selectedEmployee.id, editForm);
      toast.success("Employee updated successfully");
      closeEditModal();
      fetchEmployees();
    } catch (error: unknown) {
      console.error("Error updating employee:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeactivateConfirm = (id: string, name: string) => {
    setEmployeeToDeactivate({ id, name });
    setShowDeactivateConfirm(true);
  };

  const closeDeactivateConfirm = () => {
    setShowDeactivateConfirm(false);
    setEmployeeToDeactivate(null);
  };

  const handleDeactivate = async () => {
    if (!employeeToDeactivate) return;

    try {
      await employeeApi.deactivate(employeeToDeactivate.id);
      toast.success("Employee deactivated successfully");
      closeDeactivateConfirm();
      fetchEmployees();
    } catch (error: unknown) {
      console.error("Error deactivating employee:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to deactivate employee"
      );
    }
  };

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      await employeeApi.createSalary({
        employeeId: selectedEmployee.id,
        baseSalary: parseFloat(salaryForm.baseSalary),
        effectiveDate: salaryForm.effectiveDate,
      });
      toast.success("Salary record added successfully");
      closeAddSalaryModal();

      // Refresh salary data if detail modal is open
      if (showDetailModal) {
        const salaries = await employeeApi.getSalaryHistory(
          selectedEmployee.id
        );
        setEmployeeSalaries(salaries);
      }
    } catch (error: unknown) {
      console.error("Error adding salary:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    try {
      setIsSubmitting(true);
      await employeeApi.updateSalary(selectedSalary.id, {
        baseSalary: parseFloat(salaryForm.baseSalary),
        effectiveDate: salaryForm.effectiveDate,
      });
      toast.success("Salary record updated successfully");
      closeEditSalaryModal();

      // Refresh salary data
      if (selectedEmployee) {
        const salaries = await employeeApi.getSalaryHistory(
          selectedEmployee.id
        );
        setEmployeeSalaries(salaries);
      }
    } catch (error: unknown) {
      console.error("Error updating salary:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteSalaryConfirm = (id: string) => {
    setSalaryToDelete(id);
    setShowDeleteSalaryConfirm(true);
  };

  const closeDeleteSalaryConfirm = () => {
    setShowDeleteSalaryConfirm(false);
    setSalaryToDelete(null);
  };

  const handleDeleteSalary = async () => {
    if (!salaryToDelete) return;

    try {
      await employeeApi.deleteSalary(salaryToDelete);
      toast.success("Salary record deleted successfully");
      closeDeleteSalaryConfirm();

      // Refresh salary data
      if (selectedEmployee) {
        const salaries = await employeeApi.getSalaryHistory(
          selectedEmployee.id
        );
        setEmployeeSalaries(salaries);
      }
    } catch (error: unknown) {
      console.error("Error deleting salary:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete salary");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEmployees();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("");
    setStatusFilter(true);
    setCurrentPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold text-gray-800">
              Employee Management
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Manage employee records, salaries, and information
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && handleSearch()
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name, email, or employee ID..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept: Department) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={
                    statusFilter === undefined ? "" : statusFilter.toString()
                  }
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val: string = e.target.value;
                    setStatusFilter(val === "" ? undefined : val === "true");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
          )}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">All Employees</div>
            <div className="text-sm text-gray-600">
              Total: {employees.length} employees
            </div>
          </div>

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
                    Designation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Join Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {employees.map((employee: Employee) => (
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
                      {employee.designation}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(employee.joinDate)}
                    </td>
                    <td className="px-4 py-4">
                      {employee.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <UserX className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(employee)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {employee.isActive && (
                          <button
                            onClick={() =>
                              openDeactivateConfirm(employee.id, employee.name)
                            }
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Deactivate"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                  onClick={() =>
                    setCurrentPage((prev: number) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev: number) =>
                      Math.min(totalPages, prev + 1)
                    )
                  }
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

      {/* Modals */}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          salaries={employeeSalaries}
          leaves={employeeLeaves}
          isLoading={isLoadingDetails}
          onClose={closeDetailModal}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
          onAddSalary={() => {
            closeDetailModal();
            openAddSalaryModal(selectedEmployee);
          }}
          onEditSalary={(salary: Salary) => {
            openEditSalaryModal(salary);
          }}
          onDeleteSalary={openDeleteSalaryConfirm}
        />
      )}

      {showAddModal && (
        <AddEmployeeModal
          form={addForm}
          setForm={setAddForm}
          departments={departments}
          isSubmitting={isSubmitting}
          onSubmit={handleAddEmployee}
          onClose={closeAddModal}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          form={editForm}
          setForm={setEditForm}
          departments={departments}
          isSubmitting={isSubmitting}
          onSubmit={handleEditEmployee}
          onClose={closeEditModal}
        />
      )}

      {showAddSalaryModal && selectedEmployee && (
        <SalaryModal
          title="Add Salary Record"
          employee={selectedEmployee}
          form={salaryForm}
          setForm={setSalaryForm}
          isSubmitting={isSubmitting}
          onSubmit={handleAddSalary}
          onClose={closeAddSalaryModal}
        />
      )}

      {showEditSalaryModal && selectedSalary && selectedEmployee && (
        <SalaryModal
          title="Edit Salary Record"
          employee={selectedEmployee}
          form={salaryForm}
          setForm={setSalaryForm}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSalary}
          onClose={closeEditSalaryModal}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && employeeToDeactivate && (
        <ConfirmationModal
          title="Deactivate Employee"
          message={`Are you sure you want to deactivate ${employeeToDeactivate.name}? This will restrict their access to the system.`}
          confirmText="Deactivate"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDeactivate}
          onCancel={closeDeactivateConfirm}
        />
      )}

      {/* Delete Salary Confirmation Modal */}
      {showDeleteSalaryConfirm && salaryToDelete && (
        <ConfirmationModal
          title="Delete Salary Record"
          message="Are you sure you want to delete this salary record? This action cannot be undone."
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDeleteSalary}
          onCancel={closeDeleteSalaryConfirm}
        />
      )}
    </div>
  );
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  title,
  message,
  confirmText,
  confirmButtonClass,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail Modal Component
interface EmployeeDetailModalProps {
  employee: Employee;
  salaries: Salary[];
  leaves: Leave[];
  isLoading: boolean;
  onClose: () => void;
  formatDate: (dateString?: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => string;
  onAddSalary: () => void;
  onEditSalary: (salary: Salary) => void;
  onDeleteSalary: (id: string) => void;
}

function EmployeeDetailModal({
  employee,
  salaries,
  leaves,
  isLoading,
  onClose,
  formatDate,
  formatCurrency,
  getStatusBadge,
  onAddSalary,
  onEditSalary,
  onDeleteSalary,
}: EmployeeDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {employee.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {employee.employeeId} • {employee.designation}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium text-gray-800">
                    {employee.email}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Personal Email</div>
                  <div className="font-medium text-gray-800">
                    {employee.personalEmail || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium text-gray-800">
                    {employee.phone || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="font-medium text-gray-800">
                    {formatDate(employee.dateOfBirth)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="font-medium text-gray-800">
                    {employee.address || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Marital Status</div>
                  <div className="font-medium text-gray-800">
                    {employee.maritalStatus || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Department</div>
                  <div className="font-medium text-gray-800">
                    {employee.department.name}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Designation</div>
                  <div className="font-medium text-gray-800">
                    {employee.designation}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Join Date</div>
                  <div className="font-medium text-gray-800">
                    {formatDate(employee.joinDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="font-medium text-gray-800">
                    {employee.role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary History */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Salary History
              </h3>
              <button
                onClick={onAddSalary}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Salary
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : salaries.length > 0 ? (
              <div className="space-y-2">
                {salaries.map((salary: Salary) => (
                  <div
                    key={salary.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {formatCurrency(salary.baseSalary)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Effective: {formatDate(salary.effectiveDate)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditSalary(salary)}
                        className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSalary(salary.id)}
                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <IndianRupee className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">No salary records found</p>
                <button
                  onClick={onAddSalary}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Salary Record
                </button>
              </div>
            )}
          </div>

          {/* Leave History */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Leave History
            </h3>
            {isLoading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : leaves.length > 0 ? (
              <div className="space-y-2">
                {leaves.map((leave: Leave) => (
                  <div key={leave.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-800">
                          {leave.leaveType}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(leave.startDate)} -{" "}
                          {formatDate(leave.endDate)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{leave.reason}</div>
                    {leave.approvedBy && (
                      <div className="text-xs text-gray-500 mt-2">
                        {leave.status === "APPROVED" ? "Approved" : "Rejected"}{" "}
                        by: {leave.approvedBy.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No leave records found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Employee Modal Component
interface AddEmployeeModalProps {
  form: RegisterEmployeeInput & { baseSalary?: string };
  setForm: (form: RegisterEmployeeInput & { baseSalary?: string }) => void;
  departments: Department[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function AddEmployeeModal({
  form,
  setForm,
  departments,
  isSubmitting,
  onSubmit,
  onClose,
}: AddEmployeeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Default password: Password@123
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                required
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept: Department) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email *
              </label>
              <input
                type="email"
                required
                value={form.personalEmail}
                onChange={(e) =>
                  setForm({ ...form, personalEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status *
              </label>
              <select
                required
                value={form.maritalStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maritalStatus: e.target.value as
                      | "SINGLE"
                      | "MARRIED"
                      | "DIVORCED"
                      | "WIDOWED",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "EMPLOYEE" | "HR",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Salary Field */}
            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Initial Salary (Optional)
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.baseSalary}
                  onChange={(e) =>
                    setForm({ ...form, baseSalary: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter salary amount in INR"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to add salary later
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Employee Modal Component
interface EditEmployeeModalProps {
  employee: Employee;
  form: UpdateEmployeeInput;
  setForm: (form: UpdateEmployeeInput) => void;
  departments: Department[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function EditEmployeeModal({
  employee,
  form,
  setForm,
  departments,
  isSubmitting,
  onSubmit,
  onClose,
}: EditEmployeeModalProps) {
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (optional)
              </label>
              <input
                type="password"
                value={form.password || ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={form.designation || ""}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={form.departmentId || ""}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept: Department) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={form.role || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "EMPLOYEE" | "HR",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.isActive?.toString() || "true"}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "true" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Salary Modal Component
interface SalaryModalProps {
  title: string;
  employee: Employee;
  form: { baseSalary: string; effectiveDate: string };
  setForm: (form: { baseSalary: string; effectiveDate: string }) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function SalaryModal({
  title,
  employee,
  form,
  setForm,
  isSubmitting,
  onSubmit,
  onClose,
}: SalaryModalProps) {
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Employee</div>
            <div className="font-bold text-gray-800">{employee.name}</div>
            <div className="text-xs text-gray-500">{employee.employeeId}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={form.baseSalary}
                onChange={(e) =>
                  setForm({ ...form, baseSalary: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date *
            </label>
            <input
              type="date"
              required
              value={form.effectiveDate}
              onChange={(e) =>
                setForm({ ...form, effectiveDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
