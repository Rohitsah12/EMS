import { prisma } from '../lib/prismaClient.js';
import type { GetDashboardStatsQuery } from '../api/validation/dashboard.validation.js';

class DashboardService {

  private formatDateRange(startDate: Date, endDate: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    if (startDate.toDateString() === endDate.toDateString()) {
      return start;
    }
    return `${start} - ${end}`;
  }

 
  async getDashboardStats(query: GetDashboardStatsQuery) {
    const { attendanceDays, leaveDays } = query;

    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStartMonth = currentQuarter * 3;
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
    const quarterEnd = new Date(
      now.getFullYear(),
      quarterStartMonth + 3,
      0,
      23,
      59,
      59
    );
    const attendanceCheckDate = new Date();
    attendanceCheckDate.setDate(attendanceCheckDate.getDate() - attendanceDays);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

   
    const [
      totalActiveEmployees,
      totalDepartments,
      latestSalaries,
      totalLeaveRequests,
      approvedLeaves,
      rejectedLeaves,
      pendingLeaves,
      // Row 3: Insights
      employeesWithMissingAttendance,
      employeesWithFrequentLeave,
      // Row 4: Pending Table
      pendingLeaveRequests,
    ] = await Promise.all([
      // Row 1
      prisma.employee.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.employee.findMany({
        where: { isActive: true },
        select: {
          salaryHistory: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
            select: { baseSalary: true },
          },
        },
      }),
      // Row 2
      prisma.leave.count({
        where: { requestedAt: { gte: quarterStart, lte: quarterEnd } },
      }),
      prisma.leave.count({
        where: {
          requestedAt: { gte: quarterStart, lte: quarterEnd },
          status: 'APPROVED',
        },
      }),
      prisma.leave.count({
        where: {
          requestedAt: { gte: quarterStart, lte: quarterEnd },
          status: 'REJECTED',
        },
      }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      // Row 3
      prisma.employee.findMany({
        where: {
          isActive: true,
          attendanceRecords: { none: { date: { gte: attendanceCheckDate } } },
        },
        select: {
          id: true,
          name: true,
          department: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.findMany({
        where: {
          isActive: true,
          leaves: { some: { requestedAt: { gte: sixMonthsAgo } } },
        },
        select: {
          id: true,
          name: true,
          department: { select: { name: true } },
          leaves: {
            where: { requestedAt: { gte: sixMonthsAgo } },
            select: { id: true },
          },
        },
      }),
      // Row 4
      prisma.leave.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          reason: true,
          status: true,
          requestedAt: true,
          employee: {
            select: {
              id: true,
              name: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
        take: 50,
      }),
    ]);

    
    const totalMonthlyPayroll = latestSalaries.reduce((sum, emp) => {
      const salary = emp.salaryHistory[0]?.baseSalary || 0;
      return sum + Number(salary);
    }, 0);

    // Row 3
    const missingAttendanceList = employeesWithMissingAttendance.map((emp) => ({
      id: emp.id,
      name: emp.name,
      department: emp.department.name,
      displayText: `${emp.name} (${emp.department.name})`,
    }));

    const frequentLeaveList = employeesWithFrequentLeave
      .filter((emp) => emp.leaves.length > leaveDays)
      .map((emp) => ({
        id: emp.id,
        name: emp.name,
        department: emp.department.name,
        leaveCount: emp.leaves.length,
        displayText: `${emp.name} (${emp.department.name})`,
      }))
      .sort((a, b) => b.leaveCount - a.leaveCount);

    // Row 4
    const formattedPendingRequests = pendingLeaveRequests.map((leave) => ({
      id: leave.id,
      employeeName: leave.employee.name,
      employeeId: leave.employee.id,
      department: leave.employee.department.name,
      leaveType: leave.leaveType,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      dates: this.formatDateRange(leave.startDate, leave.endDate),
      reason: leave.reason,
      status: leave.status,
      requestedAt: leave.requestedAt.toISOString(),
    }));

   
    return {
      kpis: {
        totalActiveEmployees,
        totalDepartments,
        totalMonthlyPayroll: (totalMonthlyPayroll / 12).toFixed(2), // You were missing the / 12
      },
      leaveSummary: {
        quarter: {
          number: currentQuarter + 1,
          startDate: quarterStart.toISOString(),
          endDate: quarterEnd.toISOString(),
        },
        totalRequests: totalLeaveRequests,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        pending: pendingLeaves,
      },
      insights: {
        missingAttendance: {
          threshold: attendanceDays,
          employees: missingAttendanceList,
        },
        frequentLeave: {
          threshold: leaveDays,
          period: '6 months',
          employees: frequentLeaveList,
        },
      },
      pendingRequests: formattedPendingRequests,
    };
  }
}

export const dashboardService = new DashboardService();