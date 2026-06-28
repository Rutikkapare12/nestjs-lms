import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
} from 'class-validator';

export type Environment = 'development' | 'production' | 'testing';

export class EnvironmentVariables {
  @IsIn(['development', 'production', 'testing'])
  @IsOptional()
  NODE_ENV: Environment = 'development';

  @IsNotEmpty()
  @IsNumber()
  PORT: number = 3000;

  @IsNotEmpty()
  @IsString()
  MONGO_URI: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsNumber()
  JWT_EXPIRATION: number = 3600;

  @IsOptional()
  @IsString()
  LOG_LEVEL: string = 'debug';

  @IsOptional()
  @IsNumber()
  MONGO_POOL_SIZE: number = 10;

  @IsOptional()
  @IsNumber()
  MONGO_CONNECTION_TIMEOUT: number = 5000;

  @IsOptional()
  @IsString()
  API_VERSION: string = 'v1';
}
