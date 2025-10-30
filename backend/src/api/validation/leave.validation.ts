import { z } from 'zod';
import { LeaveStatus } from '@prisma/client';

/**
 * Schema for validating query parameters for GET /api/leaves
 * Supports pagination and filtering by status and department
 */
export const getAllLeavesQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100)),
    status: z
      .enum(['PENDING', 'APPROVED', 'REJECTED'])
      .optional(),
    departmentId: z
      .string()
      .uuid('Invalid department ID format')
      .optional(),
    employeeId: z
      .string()
      .uuid('Invalid employee ID format')
      .optional(),
    startDate: z
      .string()
      .datetime('Invalid start date format')
      .optional(),
    endDate: z
      .string()
      .datetime('Invalid end date format')
      .optional(),
  }).refine(
    (data) => {
      // If both dates provided, startDate must be before or equal to endDate
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['startDate'],
    }
  ),
});


export const updateLeaveStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid leave request ID format'),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']).or(z.literal('APPROVED')).or(z.literal('REJECTED')).catch('APPROVED').refine(
      (val) => ['APPROVED', 'REJECTED'].includes(val),
      { message: 'Status must be either APPROVED or REJECTED' }
    ),
    remarks: z
      .string()
      .min(1, 'Remarks cannot be empty')
      .max(500, 'Remarks cannot exceed 500 characters')
      .optional(),
  }),
});

export type GetAllLeavesQuery = z.infer<typeof getAllLeavesQuerySchema>['query'];
export type UpdateLeaveStatusParams = z.infer<typeof updateLeaveStatusSchema>['params'];
export type UpdateLeaveStatusBody = z.infer<typeof updateLeaveStatusSchema>['body'];