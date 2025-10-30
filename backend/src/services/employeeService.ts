import { prisma } from '../lib/prismaClient.js';
import { ApiError }  from '../utils/apiError.js';
import bcrypt from 'bcryptjs';
import type { GetAllEmployeesQuery, UpdateEmployeeInput } from '../api/validation/employee.validation.js';
import type { Prisma } from '@prisma/client';

class EmployeeService {

  async getAll(query: GetAllEmployeesQuery) {
    const { page, limit, departmentId, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          designation: true,
          isActive: true,
          joinDate: true,
          department: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  
  async getById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const { passwordHash, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }

  
  async update(id: string, data: UpdateEmployeeInput) {
    const { password, ...restOfData } = data;

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      throw new ApiError('Employee not found', 404);
    }

    if (restOfData.email && restOfData.email !== existingEmployee.email) {
      const existing = await prisma.employee.findUnique({
        where: { email: restOfData.email },
      });
      if (existing) {
        throw new ApiError('An employee with this email already exists', 409);
      }
    }

    // Check for personalEmail uniqueness if being updated
    if (restOfData.personalEmail && restOfData.personalEmail !== existingEmployee.personalEmail) {
      const existing = await prisma.employee.findUnique({
        where: { personalEmail: restOfData.personalEmail },
      });
      if (existing) {
        throw new ApiError('An employee with this personal email already exists', 409);
      }
    }

    // Check for phone uniqueness if being updated
    if (restOfData.phone && restOfData.phone !== existingEmployee.phone) {
      const existing = await prisma.employee.findUnique({
        where: { phone: restOfData.phone },
      });
      if (existing) {
        throw new ApiError('An employee with this phone number already exists', 409);
      }
    }

    if (restOfData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: restOfData.departmentId },
      });
      if (!department) {
        throw new ApiError('Department not found', 404);
      }
    }
    const updateData: Prisma.EmployeeUpdateInput = {};

    // Only add properties that are actually defined
    if (restOfData.name !== undefined) updateData.name = restOfData.name;
    if (restOfData.email !== undefined) updateData.email = restOfData.email;
    if (restOfData.dateOfBirth !== undefined) updateData.dateOfBirth = restOfData.dateOfBirth;
    if (restOfData.maritalStatus !== undefined) updateData.maritalStatus = restOfData.maritalStatus;
    if (restOfData.designation !== undefined) updateData.designation = restOfData.designation;
    if (restOfData.departmentId !== undefined) {
      updateData.department = { connect: { id: restOfData.departmentId } };
    }
    if (restOfData.personalEmail !== undefined) updateData.personalEmail = restOfData.personalEmail;
    if (restOfData.phone !== undefined) updateData.phone = restOfData.phone;
    if (restOfData.address !== undefined) updateData.address = restOfData.address;
    if (restOfData.role !== undefined) updateData.role = restOfData.role;
    if (restOfData.isActive !== undefined) updateData.isActive = restOfData.isActive;

    // Add hashed password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.passwordHash = hashedPassword;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...employeeWithoutPassword } = updatedEmployee;
    return employeeWithoutPassword;
  }

 
  async deactivate(id: string) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Employee not found', 404);
    }
    
    if (!existing.isActive) {
      throw new ApiError('Employee is already inactive', 400);
    }

    const deactivatedEmployee = await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: `Employee ${deactivatedEmployee.name} has been deactivated.` };
  }
}

export const employeeService = new EmployeeService();