import { z } from 'zod';
import { MaritalStatus, UserRole } from '@prisma/client';

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const phoneRegex = /^\+?[1-9]\d{1,14}$/;



export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid login email address'),
    password: z
      .string()
      .regex(
        strongPasswordRegex,
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      ),

    dateOfBirth: z.coerce.date().describe('Date of birth is required'),
    maritalStatus: z.nativeEnum(MaritalStatus), 
    designation: z.string().min(2, 'Designation is required'),
    departmentId: z
      .string()
      .uuid('Invalid Department ID format'),

    personalEmail: z.string().email('Invalid personal email'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
    address: z.string().min(5, 'Address must be at least 5 characters'),

    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterEmployeeInput = z.infer<typeof registerSchema>['body'];
export type LoginUserInput = z.infer<typeof loginSchema>['body'];