import type { Request, Response, NextFunction } from "express";

type AsyncHandlerFn = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandlerFn) =>
    (req: Request, res: Response, next: NextFunction): Promise<void> =>
        Promise.resolve(fn(req, res, next)).catch(next); 

export default asyncHandler;