import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type { 
  GetAllLeavesQuery, 
  UpdateLeaveStatusBody 
} from '../api/validation/leave.validation.js';
import type { Prisma, LeaveStatus } from '@prisma/client';

class LeaveService {

  async getAll(query: GetAllLeavesQuery) {
    const { 
      page, 
      limit, 
      status, 
      departmentId, 
      employeeId,
      startDate,
      endDate 
    } = query;

    const skip = (page - 1) * limit;

    // Build dynamic WHERE clause
    const where: Prisma.LeaveWhereInput = {};

    // Filter by status
    if (status) {
      where.status = status as LeaveStatus;
    }

    // Filter by department
    if (departmentId) {
      where.employee = {
        departmentId: departmentId,
      };
    }

    // Filter by specific employee
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        where.AND.push({
          startDate: {
            gte: new Date(startDate),
          },
        });
      }

      if (endDate) {
        where.AND.push({
          endDate: {
            lte: new Date(endDate),
          },
        });
      }
    }

    try {
      // Execute queries in parallel for better performance
      const [leaves, total] = await Promise.all([
        prisma.leave.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { status: 'asc' }, // PENDING first
            { requestedAt: 'desc' }, // Most recent first
          ],
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                designation: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            approvedBy: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.leave.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: leaves,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw new ApiError('Failed to fetch leave requests', 500);
    }
  }

  
  async updateStatus(
    leaveId: string,
    status: 'APPROVED' | 'REJECTED',
    hrEmployeeId: string,
    remarks?: string
  ) {
    try {
      // 1. Verify HR employee exists and has HR role
      const hrEmployee = await prisma.employee.findUnique({
        where: { id: hrEmployeeId },
        select: { 
          id: true, 
          role: true,
          isActive: true,
        },
      });

      if (!hrEmployee) {
        throw new ApiError('HR employee not found', 404);
      }

      if (hrEmployee.role !== 'HR') {
        throw new ApiError('Only HR employees can approve/reject leave requests', 403);
      }

      if (!hrEmployee.isActive) {
        throw new ApiError('HR employee account is inactive', 403);
      }

      // 2. Find the leave request with employee details
      const leave = await prisma.leave.findUnique({
        where: { id: leaveId },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      if (!leave) {
        throw new ApiError('Leave request not found', 404);
      }

      if (leave.status !== 'PENDING') {
        throw new ApiError(
          `This leave request has already been ${leave.status.toLowerCase()}`,
          400
        );
      }

      if (!leave.employee.isActive) {
        throw new ApiError(
          'Cannot update leave request for inactive employee',
          400
        );
      }

      if (leave.employeeId === hrEmployeeId) {
        throw new ApiError(
          'You cannot approve or reject your own leave request',
          403
        );
      }

      // 6. Check if leave dates are in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const leaveStartDate = new Date(leave.startDate);
      leaveStartDate.setHours(0, 0, 0, 0);

      if (leaveStartDate < today && status === 'APPROVED') {
        throw new ApiError(
          'Cannot approve leave requests with past start dates',
          400
        );
      }

      const updatedLeave = await prisma.leave.update({
        where: { id: leaveId },
        data: {
          status: status as LeaveStatus,
          actionAt: new Date(),
          approvedById: hrEmployeeId,
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
              designation: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          approvedBy: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 8. Log the action (optional - implement based on your logging strategy)
      console.log(
        `Leave ${status} by HR ${hrEmployee.id} for employee ${leave.employee.employeeId}`,
        remarks ? `Remarks: ${remarks}` : ''
      );

      return updatedLeave;
    } catch (error) {
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle Prisma errors
      if (error instanceof Error) {
        console.error('Error updating leave status:', error);
        throw new ApiError('Failed to update leave status', 500);
      }

      throw new ApiError('An unexpected error occurred', 500);
    }
  }

  
  async getLeaveStatistics(departmentId?: string) {
    const where: Prisma.LeaveWhereInput = departmentId
      ? { employee: { departmentId } }
      : {};

    try {
      const [
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
      ] = await Promise.all([
        prisma.leave.count({ where }),
        prisma.leave.count({ where: { ...where, status: 'PENDING' } }),
        prisma.leave.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.leave.count({ where: { ...where, status: 'REJECTED' } }),
      ]);

      return {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      };
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      throw new ApiError('Failed to fetch leave statistics', 500);
    }
  }
}

export const leaveService = new LeaveService();