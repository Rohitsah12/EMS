import { prisma } from '../lib/prismaClient.js';
import { redisClient } from '../lib/redisClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/index.js';
import type { RegisterEmployeeInput, LoginUserInput } from '../api/validation/auth.validation.js';
import type { Employee, UserRole } from '@prisma/client';

class AuthService {


    private async generateTokens(employeeId: string, role: UserRole) {
        const payload = { sub: employeeId, role: role };

        if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
            throw new ApiError('JWT secrets are not configured.', 500);
        }

        const accessToken = jwt.sign(
            payload,
            config.jwtAccessSecret,
            {
                issuer: config.jwtIssuer,
                audience: config.jwtAudience,
                expiresIn: config.jwtAccessExpiration || '15m',
            } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            payload,
            config.jwtRefreshSecret,
            {
                issuer: config.jwtIssuer,
                audience: config.jwtAudience,
                expiresIn: config.jwtRefreshExpiration || '7d',
            } as jwt.SignOptions
        );

        // Store Refresh Token in Redis
        const refreshTokenExpiresInSeconds = config.refreshTokenExpiresInSeconds;
        await redisClient.set(employeeId, refreshToken, {
            EX: refreshTokenExpiresInSeconds,
        });

        return { accessToken, refreshToken };
    }
  
    private async _generateEmployeeId(): Promise<string> {
        const lastEmployee = await prisma.employee.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { employeeId: true },
        });

        let nextIdNumber = 1;
        if (lastEmployee && lastEmployee.employeeId) {
            const lastIdNumber = parseInt(lastEmployee.employeeId.split('-')[1]!);
            if (!isNaN(lastIdNumber)) {
                nextIdNumber = lastIdNumber + 1;
            }
        }

        return `EMP-${String(nextIdNumber).padStart(3, '0')}`;
    }

   
    public async registerEmployee(
        employeeData: RegisterEmployeeInput
    ): Promise<Omit<Employee, 'passwordHash'>> {
        let { name, email, password, ...restOfData } = employeeData;

        email = email.toLowerCase();
        name = name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const hashedPassword = await bcrypt.hash(password, 10);

        const employeeId = await this._generateEmployeeId();

        const newEmployee = await prisma.employee.create({
            data: {
                ...restOfData,
                name,
                email,
                employeeId, 
                passwordHash: hashedPassword,
            } as any,
        });

        const { passwordHash, ...employeeWithoutPassword } = newEmployee;
        return employeeWithoutPassword;
    }

    
    public async loginEmployee(credentials: LoginUserInput) {
        const { email, password } = credentials;

        const employee = await prisma.employee.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (
            !employee ||
            !employee.isActive ||
            !(await bcrypt.compare(password, employee.passwordHash))
        ) {
            throw new ApiError('Invalid email or password.', 401);
        }

        const tokens = await this.generateTokens(employee.id, employee.role);
        const { passwordHash, ...employeeWithoutPassword } = employee;

        return { ...tokens, employee: employeeWithoutPassword };
    }

   
    public async logoutEmployee(employeeId: string) {
        await redisClient.del(employeeId);
    }

    public async refreshAccessToken(
        refreshToken: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        let decoded: { sub: string; role: UserRole };

        try {
            decoded = jwt.verify(refreshToken, config.jwtRefreshSecret!, {
                issuer: config.jwtIssuer,
                audience: config.jwtAudience,
            }) as { sub: string; role: UserRole };

            const storedToken = await redisClient.get(decoded.sub);
            if (!storedToken || storedToken !== refreshToken) {
                throw new ApiError('Invalid or expired refresh token.', 401);
            }

            const newTokens = await this.generateTokens(decoded.sub, decoded.role);
            return newTokens;

        } catch (error) {
            throw new ApiError('Invalid or expired refresh token.', 401);
        }
    }

    public async getEmployeeProfile(
        employeeId: string
    ): Promise<Omit<Employee, 'passwordHash'> | null> {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                id: true,
                employeeId: true,
                name: true,
                dateOfBirth: true,
                maritalStatus: true,
                joinDate: true,
                designation: true,
                isActive: true,
                email: true,
                role: true,
                personalEmail: true,
                phone: true,
                address: true,
                departmentId: true,
            },
        });

        if (!employee) {
            throw new ApiError('Employee not found.', 404);
        }

        return employee as Omit<Employee, 'passwordHash'>;
    }
}

export const authService = new AuthService();