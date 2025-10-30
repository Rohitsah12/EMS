import type { Request } from 'express';
import { config } from '../config/index.js';

const parseTimeUnitToMs = (timeString: string, defaultMs: number): number => {
    const unit = timeString.slice(-1);
    const value = Number(timeString.slice(0, -1));

    if (isNaN(value)) return defaultMs;

    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return defaultMs;
    }
};

type TokenType = 'access' | 'refresh';

export const generateCookieOptions = (req: Request, tokenType: TokenType) => {
    const forwardedProto = (req.headers['x-forwarded-proto'] as string) || '';
    const isSecureRequest = req.secure || forwardedProto === 'https';
    const secure = config.nodeEnv === 'production' && isSecureRequest;
    const maxAge = tokenType === 'access'
        ? parseTimeUnitToMs(config.jwtAccessExpiration!, 15 * 60 * 1000)
        : parseTimeUnitToMs(config.jwtRefreshExpiration!, 7 * 24 * 60 * 60 * 1000);

    const sameSite: "lax" | "strict" | "none" = secure ? "none" : "lax";

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
        maxAge,
    };
};