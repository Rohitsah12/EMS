import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { config } from '../config/index.js';
import type { AuthenticatedRequest, JwtPayload } from '../types/index.js';
import { UserRole } from '@prisma/client';


export const requireAuth = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError('Authentication required. No token provided.', 401);
    }

    try {
      const decoded = jwt.verify(token, config.jwtAccessSecret!, {
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      }) as JwtPayload;

      req.user = { id: decoded.sub, role: decoded.role };
      next();
    } catch (error) {
      throw new ApiError('Invalid or expired access token.', 401);
    }
  }
);


export const isHR = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRole.HR) {
      throw new ApiError(
        'Access denied. You do not have permission to perform this action.',
        403
      );
    }
    next();
  }
);