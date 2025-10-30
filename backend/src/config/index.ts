import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 8000,
    frontend_url : process.env.FRONTEND_URL || "http://localhost:3000",
    databaseUrl: process.env.DATABASE_URL || "your_database_url",
  
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "SecretKey",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "SecretKey",
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION ,
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION ,
    jwtAudience: process.env.JWT_AUDIENCE || "your_audience",
    jwtIssuer: process.env.JWT_ISSUER || "your_issuer",
    refreshTokenExpiresInSeconds: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ? Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS) : 7 * 24 * 60 * 60, // Default to 7 days


    redisHost: process.env.REDIS_HOST || "your_redis_host",
    redisPort: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    redisUsername: process.env.REDIS_USERNAME || "default",
    redisPassword: process.env.REDIS_PASSWORD || "your_redis_password",
}