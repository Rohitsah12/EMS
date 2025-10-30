import { prisma } from '../lib/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import type {
    GetAllAttendanceQuery,
    CreateOrUpdateAttendanceInput,
    UpdateAttendanceInput,
} from '../api/validation/attendance.validation.js';
import type { Prisma } from '@prisma/client';

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

    /**
     * @desc    Delete an attendance record
     */
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