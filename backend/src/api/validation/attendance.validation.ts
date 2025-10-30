import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const attendanceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid attendance record ID'),
  }),
});

export const getAllAttendanceQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.nativeEnum(AttendanceStatus).optional(),
    employeeId: z.string().uuid('Invalid employee ID').optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  ),
});


export const createOrUpdateAttendanceSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Employee ID is required'),
    date: z.coerce.date(),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional().nullable(),
  }),
});

// Schema for updating an existing attendance record by its ID
export const updateAttendanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid attendance record ID'),
  }),
  body: z
    .object({
      status: z.nativeEnum(AttendanceStatus).optional(),
      notes: z.string().optional().nullable(),
    })
    .strict(), 
});

export type GetAllAttendanceQuery = z.infer<
  typeof getAllAttendanceQuerySchema
>['query'];
export type CreateOrUpdateAttendanceInput = z.infer<
  typeof createOrUpdateAttendanceSchema
>['body'];
export type UpdateAttendanceInput = z.infer<
  typeof updateAttendanceSchema
>['body'];