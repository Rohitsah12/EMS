import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { departmentService } from '../../services/departmentService.js';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
} from '../validation/department.validation.js';

 const createDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const { body: data } = await createDepartmentSchema.parseAsync({
      body: req.body,
    });

    const newDepartment = await departmentService.create(data);

    res
      .status(201)
      .json(
        new ApiResponse('Department created successfully', newDepartment, true)
      );
  }
);


const getAllDepartments = asyncHandler(
  async (req: Request, res: Response) => {
    const departments = await departmentService.getAll();
    res
      .status(200)
      .json(
        new ApiResponse(
          'Departments fetched successfully',
          departments,
          true
        )
      );
  }
);


 const getDepartmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { params } = await departmentIdParamSchema.parseAsync({
      params: req.params,
    });

    const department = await departmentService.getById(params.id);
    res
      .status(200)
      .json(
        new ApiResponse('Department fetched successfully', department, true)
      );
  }
);

 const updateDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, body: data } = await updateDepartmentSchema.parseAsync({
      params: req.params,
      body: req.body,
    });

    const updatedDepartment = await departmentService.update(params.id, data);

    res
      .status(200)
      .json(
        new ApiResponse(
          'Department updated successfully',
          updatedDepartment,
          true
        )
      );
  }
);


 const deleteDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const { params } = await departmentIdParamSchema.parseAsync({
      params: req.params,
    });

    const result = await departmentService.delete(params.id);
    res
      .status(200)
      .json(new ApiResponse(result.message, null, true));
  }
);

export const departmentController = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};