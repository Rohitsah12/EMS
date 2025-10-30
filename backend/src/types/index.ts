import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  prm?: any;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}