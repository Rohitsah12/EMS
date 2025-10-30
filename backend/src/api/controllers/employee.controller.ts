import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { employeeService } from '../../services/employeeService.js';

import {
  getAllEmployeesQuerySchema,
  employeeIdParamSchema,
  updateEmployeeSchema,
} from '../validation/employee.validation.js';


const getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
  const { query } = await getAllEmployeesQuerySchema.parseAsync({
    query: req.query,
  });

  const result = await employeeService.getAll(query);

  res
    .status(200)
    .json(
      new ApiResponse('Employees fetched successfully', {
        data: result.data,
        pagination: result.meta,
      }, true)
    );
});


const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
  const { params } = await employeeIdParamSchema.parseAsync({
    params: req.params,
  });

  const employee = await employeeService.getById(params.id);
  res
    .status(200)
    .json(new ApiResponse('Employee fetched successfully', employee, true));
});


const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { params, body: data } = await updateEmployeeSchema.parseAsync({
    params: req.params,
    body: req.body,
  });

  const updatedEmployee = await employeeService.update(params.id, data);
  res
    .status(200)
    .json(
      new ApiResponse('Employee updated successfully', updatedEmployee, true)
    );
});


const deactivateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { params } = await employeeIdParamSchema.parseAsync({
    params: req.params,
  });

  const result = await employeeService.deactivate(params.id);
  res.status(200).json(new ApiResponse(result.message, null, true));
});

export const employeeController = {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};