import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type { CreateSalaryInput, UpdateSalaryInput } from '../api/validation/salary.validation.js';

class SalaryService {

  async create(data: CreateSalaryInput) {
    const { employeeId, baseSalary, effectiveDate } = data;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const newSalary = await prisma.salary.create({
      data: {
        employeeId: employeeId,
        baseSalary: baseSalary,
        effectiveDate: effectiveDate,
      },
      include: {
        employee: { select: { id: true, name: true, employeeId: true } },
      },
    });

    return newSalary;
  }


  async getByEmployeeId(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const salaryHistory = await prisma.salary.findMany({
      where: { employeeId: employeeId },
      orderBy: { effectiveDate: 'desc' },
    });

    return salaryHistory;
  }

  
  async update(id: string, data: UpdateSalaryInput) {
    // 1. Check if salary record exists
    const existing = await prisma.salary.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Salary record not found', 404);
    }

    // 2. Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    // 3. Update the record
    const updatedSalary = await prisma.salary.update({
      where: { id },
      data: updateData,
    });
    return updatedSalary;
  }

  
  async delete(id: string) {
    // 1. Check if salary record exists
    const existing = await prisma.salary.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Salary record not found', 404);
    }

    // 2. Delete the record
    await prisma.salary.delete({
      where: { id },
    });

    return { message: 'Salary record deleted successfully' };
  }
}

export const salaryService = new SalaryService();