import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/apiError.js';
import { leaveService } from '../../services/leaveService.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import {
    getAllLeavesQuerySchema,
    updateLeaveStatusSchema,
} from '../validation/leave.validation.js';


const getAllLeaves = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Validate query parameters
            const { query } = await getAllLeavesQuerySchema.parseAsync({
                query: req.query,
            });

            // 2. Fetch leave requests from service
            const result = await leaveService.getAll(query);

            // 3. Send successful response
            res.status(200).json(
                new ApiResponse(
                    'Leave requests fetched successfully',
                    {
                        data: result.data,
                        pagination: result.meta,
                    },
                    true
                )
            );
        } catch (error) {
            // Handle validation errors
            if (error instanceof ZodError) {
                const validationErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                return next(
                    new ApiError(
                        'Validation failed',
                        400)
                );
            }

            // Pass other errors to error handler
            next(error);
        }
    }
);


const updateLeaveStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const hrEmployeeId = req.user?.id;
            if (!hrEmployeeId) {
                throw new ApiError('Authentication required', 401);
            }

            if (req.user?.role !== 'HR') {
                throw new ApiError(
                    'Access denied. Only HR can approve/reject leave requests',
                    403
                );
            }

            // 2. Validate request params and body
            const { params, body } = await updateLeaveStatusSchema.parseAsync({
                params: req.params,
                body: req.body,
            });

            const updatedLeave = await leaveService.updateStatus(
                params.id,
                body.status,
                hrEmployeeId,
                body.remarks
            );

            // 4. Send successful response
            const statusMessage = body.status === 'APPROVED'
                ? 'approved'
                : 'rejected';

            res.status(200).json(
                new ApiResponse(
                    `Leave request ${statusMessage} successfully`,
                    updatedLeave,
                    true
                )
            );
        } catch (error) {
            // Handle validation errors
            if (error instanceof ZodError) {
                const validationErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                return next(
                    new ApiError(
                        'Validation failed',
                        400)
                );
            }

            // Pass other errors to error handler
            next(error);
        }
    }
);

/**
 * @desc    Get leave statistics
 * @route   GET /api/leaves/statistics
 * @access  Private (HR only)
 */
const getLeaveStatistics = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const departmentId = req.query.departmentId as string | undefined;

            // Validate departmentId if provided
            if (departmentId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId)) {
                throw new ApiError('Invalid department ID format', 400);
            }

            const statistics = await leaveService.getLeaveStatistics(departmentId);

            res.status(200).json(
                new ApiResponse(
                    'Leave statistics fetched successfully',
                    statistics,
                    true
                )
            );
        } catch (error) {
            next(error);
        }
    }
);

// Export controller methods
export const leaveController = {
    getAllLeaves,
    updateLeaveStatus,
    getLeaveStatistics,
};