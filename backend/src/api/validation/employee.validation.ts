import { z } from 'zod';
import { MaritalStatus, UserRole } from '@prisma/client';

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid employee ID format'),
  }),
});

export const getAllEmployeesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    isActive: z
      .preprocess(
        (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
        z.boolean().optional()
      ), // Removed .default(true) to allow querying all employees
    search: z.string().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid employee ID format'),
  }),
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Invalid login email address').optional(),
      password: z
        .string()
        .regex(
          strongPasswordRegex,
          'Password must be at least 8 chars and include uppercase, lowercase, number, and special char'
        )
        .optional(),
      dateOfBirth: z.coerce
        .date()
        .max(new Date(), 'Date of birth must be in the past')
        .refine(
          (date) => {
            const age = new Date().getFullYear() - date.getFullYear();
            return age >= 18 && age <= 100;
          },
          { message: 'Employee must be between 18 and 100 years old' }
        )
        .optional(),
      maritalStatus: z.nativeEnum(MaritalStatus).optional(),
      designation: z.string().min(2, 'Designation is required').optional(),
      departmentId: z.string().uuid('Invalid Department ID format').optional(),
      personalEmail: z.string().email('Invalid personal email').optional(),
      phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
      address: z.string().min(5, 'Address must be at least 5 chars').optional(),
      role: z.nativeEnum(UserRole).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(), 
});

export type GetAllEmployeesQuery = z.infer<
  typeof getAllEmployeesQuerySchema
>['query'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];