import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor, LoggingInterceptor } from './common/interceptors';
import { CustomLoggerService } from './common/services/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logLevel = configService.get('LOG_LEVEL', 'debug');
  const port = configService.get('PORT', 3000);

  const logger = new CustomLoggerService(logLevel);
  app.useLogger(logger);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for production
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Set API version prefix
  const apiVersion = configService.get('API_VERSION', 'v1');
  app.setGlobalPrefix(`api/${apiVersion}`);

  await app.listen(port);
  logger.log(`Application listening on port ${port}`, 'Bootstrap');
}

bootstrap();
