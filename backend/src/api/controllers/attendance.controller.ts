import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { attendanceService } from '../../services/attendanceService.js';

import {
  getAllAttendanceQuerySchema,
  createOrUpdateAttendanceSchema,
  updateAttendanceSchema,
  attendanceIdParamSchema,
  getEmployeeAttendanceSchema,
} from '../validation/attendance.validation.js';


const createOrUpdateAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Validate the request body
    const { body: data } = await createOrUpdateAttendanceSchema.parseAsync({
      body: req.body,
    });

    // 2. Call the service
    const record = await attendanceService.createOrUpdate(data);

    res
      .status(201)
      .json(
        new ApiResponse(
          'Attendance record saved successfully',
          record,
          true
        )
      );
  }
);


const getAllAttendance = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate query parameters
  const { query } = await getAllAttendanceQuerySchema.parseAsync({
    query: req.query,
  });

  const result = await attendanceService.getAll(query);

  res
    .status(200)
    .json(
      new ApiResponse(
        'Attendance records fetched successfully',
        {
          data: result.data,
          pagination: result.meta
        },
        true
      )
    );
});


const getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate URL parameter
  const { params } = await attendanceIdParamSchema.parseAsync({
    params: req.params,
  });

  // 2. Call service
  const record = await attendanceService.getById(params.id);
  res
    .status(200)
    .json(
      new ApiResponse('Attendance record fetched successfully', record, true)
    );
});

const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate params and body
  const { params, body: data } = await updateAttendanceSchema.parseAsync({
    params: req.params,
    body: req.body,
  });

  // 2. Call service
  const updatedRecord = await attendanceService.update(params.id, data);
  res
    .status(200)
    .json(
      new ApiResponse(
        'Attendance record updated successfully',
        updatedRecord,
        true
      )
    );
});

const deleteAttendance = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate URL parameter
  const { params } = await attendanceIdParamSchema.parseAsync({
    params: req.params,
  });

  // 2. Call service
  const result = await attendanceService.delete(params.id);
  res.status(200).json(new ApiResponse(result.message, null, true));
});

const getAttendanceSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getAttendanceSummary();
    
    res.status(200).json(
      new ApiResponse(
        'Attendance summary fetched successfully',
        result,
        true
      )
    );
  }
);

const getEmployeeAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: employeeId } = req.params;
    
    const { query } = await getEmployeeAttendanceSchema.parseAsync({
      query: req.query,
    });

    const filteredQuery = {
      page: query.page,
      limit: query.limit,
      ...(query.startDate !== undefined && { startDate: query.startDate }),
      ...(query.endDate !== undefined && { endDate: query.endDate }),
      ...(query.status !== undefined && { status: query.status }),
    };
    
    const result = await attendanceService.getEmployeeAttendance(
      employeeId!,
      filteredQuery
    );
    
    res.status(200).json(
      new ApiResponse(
        'Employee attendance fetched successfully',
        result,
        true
      )
    );
  }
);

// Export as a controller object
export const attendanceController = {
  createOrUpdateAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary,
  getEmployeeAttendance,
};