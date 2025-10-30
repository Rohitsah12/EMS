import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { salaryService } from '../../services/salaryService.js';

// Import validation schemas
import {
  createSalarySchema,
  updateSalarySchema,
  salaryIdParamSchema,
  employeeIdParamSchema,
} from '../validation/salary.validation.js';

/**
 * @desc    Create a new salary record
 * @route   POST /api/salaries
 * @access  Private (HR only)
 */
const createSalary = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate body
  const { body: data } = await createSalarySchema.parseAsync({
    body: req.body,
  });

  // 2. Call service
  const newSalary = await salaryService.create(data);
  res
    .status(201)
    .json(new ApiResponse('Salary record created', newSalary, true));
});

/**
 * @desc    Get all salary records for one employee
 * @route   GET /api/salaries/employee/:employeeId
 * @access  Private (HR only)
 */
const getSalariesByEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Validate params
    const { params } = await employeeIdParamSchema.parseAsync({
      params: req.params,
    });

    // 2. Call service
    const history = await salaryService.getByEmployeeId(params.employeeId);
    res
      .status(200)
      .json(new ApiResponse("Employee salary history fetched", history, true));
  }
);

/**
 * @desc    Update a specific salary record
 * @route   PATCH /api/salaries/:id
 * @access  Private (HR only)
 */
const updateSalary = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate params and body
  const { params, body: data } = await updateSalarySchema.parseAsync({
    params: req.params,
    body: req.body,
  });

  // 2. Call service
  const updatedSalary = await salaryService.update(params.id, data);
  res
    .status(200)
    .json(
      new ApiResponse('Salary record updated', updatedSalary, true)
    );
});

/**
 * @desc    Delete a specific salary record
 * @route   DELETE /api/salaries/:id
 * @access  Private (HR only)
 */
const deleteSalary = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate params
  const { params } = await salaryIdParamSchema.parseAsync({
    params: req.params,
  });

  // 2. Call service
  const result = await salaryService.delete(params.id);
  res.status(200).json(new ApiResponse(result.message, null, true));
});

// Export as a controller object
export const salaryController = {
  createSalary,
  getSalariesByEmployee,
  updateSalary,
  deleteSalary,
};