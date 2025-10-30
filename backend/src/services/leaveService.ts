import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type { 
  GetAllLeavesQuery, 
  UpdateLeaveStatusBody 
} from '../api/validation/leave.validation.js';
import { type Prisma, type LeaveStatus, AttendanceStatus } from '@prisma/client';

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
    const hrEmployee = await prisma.employee.findUnique({
      where: { id: hrEmployeeId },
      select: { id: true, role: true, isActive: true },
    });

    if (!hrEmployee || hrEmployee.role !== 'HR' || !hrEmployee.isActive) {
      throw new ApiError('HR employee is not authorized or not found', 403);
    }

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        employee: { select: { id: true, isActive: true } },
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
      throw new ApiError('Cannot update leave request for inactive employee', 400);
    }

    if (leave.employeeId === hrEmployeeId) {
      throw new ApiError('You cannot approve or reject your own leave request', 403);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (leave.startDate < today && status === 'APPROVED') {
      throw new ApiError('Cannot approve leave requests with past start dates', 400);
    }

    const [updatedLeave] = await prisma.$transaction(async (tx) => {
      const leaveUpdate = await tx.leave.update({
        where: { id: leaveId },
        data: {
          status: status,
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
              department: { select: { id: true, name: true } },
            },
          },
          approvedBy: {
            select: { id: true, employeeId: true, name: true, email: true },
          },
        },
      });

      if (status === 'APPROVED') {
        const dates = [];
        let currentDate = new Date(leaveUpdate.startDate);
        const endDate = new Date(leaveUpdate.endDate);

        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

       
        const attendancePromises = dates.map((date) =>
          tx.attendance.upsert({
            where: {
              employeeId_date: { 
                employeeId: leaveUpdate.employeeId,
                date: date,
              },
            },
            update: {
              status: AttendanceStatus.ON_LEAVE,
              notes: `Updated by approved leave ${leaveUpdate.id}`,
            },
            create: {
              employeeId: leaveUpdate.employeeId,
              date: date,
              status: AttendanceStatus.ON_LEAVE,
              notes: `Auto-generated from approved leave ${leaveUpdate.id}`,
            },
          })
        );
        
        await Promise.all(attendancePromises);
      }

      return [leaveUpdate];
    });

    console.log(
      `Leave ${status} by HR ${hrEmployee.id} for employee ${updatedLeave.employee.id}`,
      remarks ? `Remarks: ${remarks}` : ''
    );

    return updatedLeave;
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