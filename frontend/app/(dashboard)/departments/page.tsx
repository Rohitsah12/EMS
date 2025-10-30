"use client";

import { useEffect, useState } from "react";
import { departmentApi, Department } from "@/lib/api/departmentApi";
import { employeeApi, Employee } from "@/lib/api/employeeApi";
import {
  Building2,
  Users,
  IndianRupee,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Loader2,
  AlertTriangle, // Added for delete modal
} from "lucide-react";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null); // State for department to be deleted
  const [totalBudget, setTotalBudget] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    managerId: "",
    annualBudget: "",
  });

  // Manager search
  const [managerSearch, setManagerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedManager, setSelectedManager] = useState<Employee | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(data.departments);
      setTotalBudget(data.totalBudget);
    } catch (error: unknown) {
      console.error("Error fetching departments:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Search for managers
  const handleManagerSearch = async (query: string) => {
    setManagerSearch(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await employeeApi.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching managers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectManager = (employee: Employee) => {
    setSelectedManager(employee);
    setFormData({ ...formData, managerId: employee.id });
    setManagerSearch(employee.name);
    setSearchResults([]);
  };

  const handleClearManager = () => {
    setSelectedManager(null);
    setFormData({ ...formData, managerId: "" });
    setManagerSearch("");
  };

  const resetForm = () => {
    setFormData({ name: "", managerId: "", annualBudget: "" });
    setSelectedManager(null);
    setManagerSearch("");
    setSearchResults([]);
  };

  // Create Department
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await departmentApi.create({
        name: formData.name,
        managerId: formData.managerId || null,
        annualBudget: formData.annualBudget
          ? Number(formData.annualBudget)
          : null,
      });

      toast.success("Department created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchDepartments();
    } catch (error: unknown) {
      console.error("Error creating department:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create department");
    }
  };

  // Update Department
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDepartment) return;

    try {
      await departmentApi.update(selectedDepartment.id, {
        name: formData.name || undefined,
        managerId: formData.managerId || null,
        annualBudget: formData.annualBudget
          ? Number(formData.annualBudget)
          : null,
      });

      toast.success("Department updated successfully");
      setShowUpdateModal(false);
      resetForm();
      setSelectedDepartment(null);
      fetchDepartments();
    } catch (error: unknown) {
      console.error("Error updating department:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update department");
    }
  };

  // Open Delete Modal
  const openDeleteModal = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    setDepartmentToDelete(null);
    setShowDeleteModal(false);
  };

  // Confirm and Execute Delete
  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await departmentApi.delete(departmentToDelete.id);
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error: unknown) {
      console.error("Error deleting department:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete department");
    } finally {
      closeDeleteModal();
    }
  };

  // Open Update Modal
  const openUpdateModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      managerId: department.managerId || "",
      annualBudget: department.annualBudget?.toString() || "", // Correctly set budget
    });

    if (department.manager) {
      setSelectedManager({
        id: department.manager.id,
        employeeId: department.manager.employeeId,
        name: department.manager.name,
        email: "",
        designation: "",
        isActive: true,
        joinDate: "",
        department: { id: "", name: "" },
      });
      setManagerSearch(department.manager.name);
    }

    setShowUpdateModal(true);
  };

  // Calculate total stats
  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce(
    (sum, dept) => sum + dept._count.employees,
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="text-3xl font-bold text-gray-800">
          Departments Management
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Manage organizational departments
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Departments
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              {totalDepartments}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Employees
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              {totalEmployees}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Annual Budget
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-800">
              ₹{totalBudget.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">
              All Departments
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Department Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Manager
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Employees
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Annual Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800 capitalize">
                        {dept.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {dept.manager ? (
                        <div>
                          <div className="font-medium text-gray-800">
                            {dept.manager.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dept.manager.employeeId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          No manager assigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {dept._count.employees}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {dept.annualBudget ? (
                        `₹${Number(dept.annualBudget).toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openUpdateModal(dept)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Update
                        </button>
                        <button
                          onClick={() => openDeleteModal(dept)} // Changed to open custom modal
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                Create Department
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                {/* Department Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name"
                    required
                    minLength={3}
                  />
                </div>

                {/* Manager Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Manager (Optional)
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={managerSearch}
                          onChange={(e) => handleManagerSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by name, ID, or email"
                        />
                      </div>
                      {selectedManager && (
                        <button
                          type="button"
                          onClick={handleClearManager}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Selected Manager */}
                    {selectedManager && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-gray-800">
                          {selectedManager.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedManager.employeeId}
                        </div>
                      </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && !selectedManager && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleSelectManager(emp)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-gray-800">
                              {emp.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {emp.employeeId} • {emp.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {emp.designation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Annual Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Budget (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={formData.annualBudget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annualBudget: e.target.value,
                        })
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter annual budget"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Department Modal */}
      {showUpdateModal && selectedDepartment && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                Update Department
              </h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  resetForm();
                  setSelectedDepartment(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                {/* Department Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                    placeholder="Enter department name"
                    minLength={3}
                  />
                </div>

                {/* Manager Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Manager
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={managerSearch}
                          onChange={(e) => handleManagerSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by name, ID, or email"
                        />
                      </div>
                      {selectedManager && (
                        <button
                          type="button"
                          onClick={handleClearManager}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Selected Manager */}
                    {selectedManager && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-gray-800">
                          {selectedManager.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedManager.employeeId}
                        </div>
                      </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleSelectManager(emp)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-gray-800">
                              {emp.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {emp.employeeId} • {emp.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {emp.designation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Annual Budget - ADDED HERE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={formData.annualBudget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annualBudget: e.target.value,
                        })
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter annual budget"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    resetForm();
                    setSelectedDepartment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - NEW */}
      {showDeleteModal && departmentToDelete && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Confirm Deletion
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the &quot;
                  <strong>{departmentToDelete.name}</strong>&quot; department? This
                  action cannot be undone.
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}