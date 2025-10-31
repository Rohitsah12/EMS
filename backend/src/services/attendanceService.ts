import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type {
    GetAllAttendanceQuery,
    CreateOrUpdateAttendanceInput,
    UpdateAttendanceInput,
} from '../api/validation/attendance.validation.js';
import { AttendanceStatus, type Prisma } from '@prisma/client';

class AttendanceService {

    async createOrUpdate(data: CreateOrUpdateAttendanceInput) {
        const { employeeId, date, status, notes } = data;

        // Ensure employee exists
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new ApiError('Employee not found', 404);
        }

        const attendanceRecord = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: employeeId,
                    date: date,
                },
            },
            // Data to update if record exists
            update: {
                status: status,
                ...(notes !== undefined && { notes: notes }),
            },
            // Data to create if record does not exist
            create: {
                employeeId: employeeId,
                date: date,
                status: status,
                notes: notes ?? null,
            },
            include: {
                employee: { select: { id: true, name: true, employeeId: true } },
            },
        });

        return attendanceRecord;
    }


    async getAll(query: GetAllAttendanceQuery) {
        const { page, limit, status, employeeId, startDate, endDate } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.AttendanceWhereInput = {
            ...(status && { status }),
            ...(employeeId && { employeeId }),
            ...(startDate || endDate) && {
                date: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                },
            },
        };

        const [records, total] = await prisma.$transaction([
            prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    employee: {
                        select: { id: true, name: true, employeeId: true },
                    },
                },
            }),
            prisma.attendance.count({ where }),
        ]);

        return {
            data: records,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getById(id: string) {
        const record = await prisma.attendance.findUnique({
            where: { id },
            include: {
                employee: { select: { id: true, name: true, employeeId: true } },
            },
        });

        if (!record) {
            throw new ApiError('Attendance record not found', 404);
        }
        return record;
    }


    async update(id: string, data: UpdateAttendanceInput) {
        // Check if record exists
        await this.getById(id);

        const updatedRecord = await prisma.attendance.update({
            where: { id },
            data: {
                ...(data.status !== undefined && { status: data.status }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
        });
        return updatedRecord;
    }

    private async fillMissingAttendance(employeeId: string) {
        // Get employee's join date
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { joinDate: true, isActive: true },
        });

        if (!employee || !employee.isActive) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const joinDate = new Date(employee.joinDate);
        joinDate.setHours(0, 0, 0, 0);

        // If join date is today or in future, no need to fill
        if (joinDate >= today) {
            return;
        }

        // Get all existing attendance dates for this employee
        const existingAttendance = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: joinDate,
                    lte: yesterday,
                },
            },
            select: { date: true },
        });

        // Create a Set of existing dates for quick lookup
        const existingDates = new Set(
            existingAttendance.map((a) => a.date.toISOString().split('T')[0])
        );

        // Generate all dates from join date to yesterday
        const missingDates: Date[] = [];
        let currentDate = new Date(joinDate);

        while (currentDate <= yesterday) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Skip if attendance already exists
            if (!existingDates.has(dateStr)) {
                missingDates.push(new Date(currentDate));
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create ABSENT records for missing dates
        if (missingDates.length > 0) {
            await prisma.attendance.createMany({
                data: missingDates.map((date) => ({
                    employeeId,
                    date,
                    status: AttendanceStatus.ABSENT,
                    notes: 'Auto-generated: No attendance marked',
                })),
                skipDuplicates: true, // Skip if somehow already exists
            });

            console.log(
                `Generated ${missingDates.length} ABSENT records for employee ${employeeId}`
            );
        }
    }

    async fillMissingAttendanceForAll() {
        const employees = await prisma.employee.findMany({
            where: { isActive: true },
            select: { id: true },
        });

        for (const employee of employees) {
            await this.fillMissingAttendance(employee.id);
        }

        console.log(`Filled missing attendance for ${employees.length} employees`);
    }
    async getAttendanceSummary() {
        const employees = await prisma.employee.findMany({
            where: { isActive: true },
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                joinDate: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Calculate attendance % for each employee
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const summaries = await Promise.all(
            employees.map(async (employee) => {
                const joinDate = new Date(employee.joinDate);
                joinDate.setHours(0, 0, 0, 0);

                // Calculate working days (from join date to yesterday)
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                // If joined today or in future, return 0
                if (joinDate >= today) {
                    return {
                        ...employee,
                        totalDays: 0,
                        presentDays: 0,
                        absentDays: 0,
                        attendancePercentage: 0,
                    };
                }

                // Calculate total working days
                const totalDays = Math.floor(
                    (yesterday.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1;

                // Get attendance counts
                const [presentCount, absentCount] = await Promise.all([
                    prisma.attendance.count({
                        where: {
                            employeeId: employee.id,
                            date: { gte: joinDate, lte: yesterday },
                            status: {
                                in: [
                                    AttendanceStatus.PRESENT,
                                    AttendanceStatus.HALF_DAY,
                                ],
                            },
                        },
                    }),
                    prisma.attendance.count({
                        where: {
                            employeeId: employee.id,
                            date: { gte: joinDate, lte: yesterday },
                            status: AttendanceStatus.ABSENT,
                        },
                    }),
                ]);

                const attendancePercentage =
                    totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

                return {
                    ...employee,
                    totalDays,
                    presentDays: presentCount,
                    absentDays: absentCount,
                    attendancePercentage,
                };
            })
        );

        return summaries;
    }

    async getEmployeeAttendance(
        employeeId: string,
        query: { page: number; limit: number; startDate?: Date; endDate?: Date; status?: string }
    ) {
        // Fill missing attendance first
        await this.fillMissingAttendance(employeeId);

        const { page, limit, startDate, endDate, status } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.AttendanceWhereInput = {
            employeeId,
            ...(status && { status: status as AttendanceStatus }),
            ...(startDate || endDate) && {
                date: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                },
            },
        };

        const [records, total, employee] = await Promise.all([
            prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                select: {
                    id: true,
                    date: true,
                    status: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.attendance.count({ where }),
            prisma.employee.findUnique({
                where: { id: employeeId },
                select: {
                    id: true,
                    employeeId: true,
                    name: true,
                    email: true,
                    designation: true,
                    joinDate: true,
                    department: {
                        select: { id: true, name: true },
                    },
                },
            }),
        ]);

        if (!employee) {
            throw new ApiError('Employee not found', 404);
        }

        return {
            employee,
            attendance: records,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async delete(id: string) {
        // Check if record exists
        await this.getById(id);

        await prisma.attendance.delete({
            where: { id },
        });

        return { message: 'Attendance record deleted successfully' };
    }
}

export const attendanceService = new AttendanceService();