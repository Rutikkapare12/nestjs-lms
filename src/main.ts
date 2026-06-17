import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.printf(
            ({ timestamp, level, message, context }) =>
              `${timestamp} [${context || 'Application'}] ${level}: ${message}`,
          ),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'logs/app.log',
          }),
        ],
      }),
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
