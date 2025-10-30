import { z } from 'zod';

export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID format'),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Department name must be at least 3 characters'),
    managerId: z
      .string()
      .uuid('Invalid manager ID format')
      .optional()
      .nullable(),
    annualBudget: z
      .number()
      .positive('Annual budget must be positive')
      .optional()
      .nullable(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Department name must be at least 3 characters')
      .optional(),
    managerId: z
      .string()
      .uuid('Invalid manager ID format')
      .optional()
      .nullable(),
    annualBudget: z
      .number()
      .positive('Annual budget must be positive')
      .optional()
      .nullable(),
  }),
});

export type CreateDepartmentInput = z.infer<
  typeof createDepartmentSchema
>['body'];
export type UpdateDepartmentInput = z.infer<
  typeof updateDepartmentSchema
>['body'];