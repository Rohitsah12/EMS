import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { dashboardService } from '../../services/dashboardService.js';

import { getDashboardStatsSchema } from '../validation/dashboard.validation.js';


const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const { query } = await getDashboardStatsSchema.parseAsync({
    query: req.query,
  });

  // 2. Call service
  const stats = await dashboardService.getDashboardStats(query);

  // 3. Send response
  res
    .status(200)
    .json(
      new ApiResponse('Dashboard statistics fetched successfully', stats, true)
    );
});

export const dashboardController = {
  getDashboardStats,
};