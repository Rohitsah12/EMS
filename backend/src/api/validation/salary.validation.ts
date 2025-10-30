import { z } from 'zod';

export const salaryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid salary record ID'),
  }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({
    employeeId: z.string().uuid('Invalid employee ID'),
  }),
});

export const createSalarySchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Employee ID is required'),
    baseSalary: z.coerce
      .number()
      .positive('Base salary must be a positive number'),
    effectiveDate: z.coerce.date(),
  }),
});

export const updateSalarySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid salary record ID'),
  }),
  body: z
    .object({
      baseSalary: z.coerce
        .number()
        .positive('Base salary must be a positive number')
        .optional(),
      effectiveDate: z.coerce.date().optional(),
    })
    .strict(), 
});

export type CreateSalaryInput = z.infer<typeof createSalarySchema>['body'];
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>['body'];