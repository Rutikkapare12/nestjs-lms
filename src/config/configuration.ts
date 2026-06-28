import { EnvironmentVariables } from './environment';

export const configuration = (): EnvironmentVariables => {
  return {
    NODE_ENV:
      (process.env.NODE_ENV as 'development' | 'production' | 'testing') || ('development' as const),
    PORT: parseInt(process.env.PORT || '3000', 10),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/nestjs-lms',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    MONGO_POOL_SIZE: parseInt(process.env.MONGO_POOL_SIZE || '10', 10),
    MONGO_CONNECTION_TIMEOUT: parseInt(
      process.env.MONGO_CONNECTION_TIMEOUT || '5000',
      10,
    ),
    API_VERSION: process.env.API_VERSION || 'v1',
  };
};
