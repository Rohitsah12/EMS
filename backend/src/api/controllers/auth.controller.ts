import type { Request, Response } from 'express';
import { authService } from '../../services/authService.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { generateCookieOptions } from '../../utils/cookieOption.js'; // Assuming you have this util
import type {
  RegisterEmployeeInput,
  LoginUserInput,
} from '../validation/auth.validation.js';
import type { AuthenticatedRequest } from '../../types/index.js'; // For req.user


const registerEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const employeeData = req.body as RegisterEmployeeInput;

    const newEmployee = await authService.registerEmployee(employeeData);

    res
      .status(201)
      .json(
        new ApiResponse(
          'Employee registered successfully',
          { employee: newEmployee },
          true
        )
      );
  }
);


const loginEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const credentials = req.body as LoginUserInput;

    const { accessToken, refreshToken, employee } =
      await authService.loginEmployee(credentials);

    // Set cookies
    res.cookie(
      'accessToken',
      accessToken,
      generateCookieOptions(req, 'access')
    );
    res.cookie(
      'refreshToken',
      refreshToken,
      generateCookieOptions(req, 'refresh')
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          'Login successful',
          { employee, accessToken, refreshToken },
          true
        )
      );
  }
);


const logoutEmployee = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const employeeId = req.user?.id;
    if (!employeeId) {
      throw new ApiError('Not authenticated', 401);
    }

    await authService.logoutEmployee(employeeId);

    // Clear cookies
    res.clearCookie('accessToken', { httpOnly: true, secure: true }); // Adjust options as needed
    res.clearCookie('refreshToken', { httpOnly: true, secure: true }); // Adjust options as needed

    res
      .status(200)
      .json(new ApiResponse('Logout successful', null, true));
  }
);


const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError('Refresh token missing', 401);
    }

    const { accessToken, refreshToken } =
      await authService.refreshAccessToken(incomingRefreshToken);

    // Set new cookies
    res.cookie(
      'accessToken',
      accessToken,
      generateCookieOptions(req, 'access')
    );
    res.cookie(
      'refreshToken',
      refreshToken,
      generateCookieOptions(req, 'refresh')
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          'Token refreshed successfully',
          { accessToken, refreshToken },
          true
        )
      );
  }
);


const getEmployeeProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const employeeId = req.user?.id;
    if (!employeeId) {
      throw new ApiError('Not authenticated', 401);
    }

    const employeeProfile = await authService.getEmployeeProfile(employeeId);

    res
      .status(200)
      .json(
        new ApiResponse(
          'Profile fetched successfully',
          { employee: employeeProfile },
          true
        )
      );
  }
);

export const authController = {
  registerEmployee,
  loginEmployee,
  logoutEmployee,
  refreshAccessToken,
  getEmployeeProfile,
};