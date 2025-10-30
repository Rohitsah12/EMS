import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  prm?: any;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}