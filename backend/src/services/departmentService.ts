import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../api/validation/department.validation.js';
import type { Prisma } from '@prisma/client';

class DepartmentService {
 
  async create(data: CreateDepartmentInput) {
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ApiError('A department with this name already exists', 409);
    }

    const createData: Prisma.DepartmentCreateInput = {
      name: data.name.toLowerCase(),
    };
    if (data.managerId) {
      createData.manager = {
        connect: { id: data.managerId },
      };
    }

    const department = await prisma.department.create({
      data: createData,
    });
    return department;
  }


  async getAll() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        // Include the manager's name and ID
        manager: {
          select: { id: true, name: true, employeeId: true },
        },
        // Include a count of how many employees are in this department
        _count: {
          select: { employees: true },
        },
      },
    });
    return departments;
  }

  /**
   * @desc    Get a single department by its ID
   */
  async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, employeeId: true },
        },
        // Include the list of active employees in this department
        employees: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            designation: true,
            email: true,
          },
          where: { isActive: true },
        },
      },
    });

    if (!department) {
      throw new ApiError('Department not found', 404);
    }
    return department;
  }

  /**
   * @desc    Update a department's details
   */
  async update(id: string, data: UpdateDepartmentInput) {
    // First, check if the department exists
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Department not found', 404);
    }

    // If name is being changed, check if the new name is already taken by *another* department
    if (data.name && data.name !== existing.name) {
      const nameTaken = await prisma.department.findUnique({
        where: { name: data.name },
      });
      if (nameTaken) {
        throw new ApiError('A department with this name already exists', 409);
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: data as Prisma.DepartmentUpdateInput
    });
    return updatedDepartment;
  }

  
  async delete(id: string) {
    const employeeCount = await prisma.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      throw new ApiError(
        `Cannot delete department: ${employeeCount} employees are still assigned. Reassign them first.`,
        400 
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }
}

export const departmentService = new DepartmentService();