import type { NextFunction, Request, Response } from "express";
import { config } from "../config/index.js";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError
} from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong"; 
  let errors: string[] = [];

  // Handle ApiError instances FIRST
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = err.issues.map(issue => issue.message);
  }
  // Handle Prisma errors
  else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint failed
        statusCode = 409;
        if (err.meta?.target) {
          message = `Duplicate entry: a record with the field ${(err.meta.target as string[]).join(", ")} already exists`;
        } else {
          message = "Duplicate entry: a record with this field already exists";
        }
        break;

      case "P2003": // Foreign key constraint failed
        statusCode = 400;
        const field = err.meta?.field_name as string;
        if (field) {
          message = `Invalid reference: The ${field} provided does not exist.`;
        } else {
          message = "Invalid reference: one of the related records does not exist.";
        }
        break;

      case "P2025": // Record not found
        statusCode = 404;
        if (err.meta?.modelName) {
          message = `${err.meta.modelName} not found`;
        } else {
          message = "Requested resource not found";
        }
        break;

      case "P1001": // Can't reach database
        statusCode = 503;
        message = "Our database is currently unreachable. Please try again in a few minutes.";
        break;

      case "P1002": // Database timeout
        statusCode = 503;
        message = "Database operation timed out. Please refresh and try again.";
        break;

      default:
        statusCode = 400;
        message = "Database request error";
    }
  } 
  else if (err instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } 
  else if (err instanceof PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database connection error";
  } 
  else if (err instanceof PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Unexpected database error";
  }
  // Generic errors
  else {
    statusCode = err.statusCode || 500;
    message = err.message || "Something went wrong";
    
    if (config.nodeEnv !== "PRODUCTION") {
      errors.push(err.message || "Unknown error");
    }
  }

  // Add any additional errors from the error object
  if (err.errors && Array.isArray(err.errors)) {
    errors = errors.concat(err.errors);
  }

  // Log error in development
  if (config.nodeEnv !== "PRODUCTION") {
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      statusCode,
      stack: err.stack
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};