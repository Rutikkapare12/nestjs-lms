import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseModule } from './modules/course/course.module';
import { AuditModule } from './audit/audit.module';
import { configuration } from './config';
import { EnvironmentVariables } from './config/environment';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApiVersionMiddleware, AuditMiddleware } from './common/middlewares';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: async (config: Record<string, any>) => {
        const validatedConfig = plainToClass(EnvironmentVariables, config, {
          enableImplicitConversion: true,
        });
        const errors = await validate(validatedConfig, {
          skipMissingProperties: false,
        });
        if (errors.length > 0) {
          throw new Error(
            `Configuration validation failed: ${errors.map((e) => e.toString()).join(', ')}`,
          );
        }
        return validatedConfig;
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        const poolSize = configService.get<number>('MONGO_POOL_SIZE', 10);
        const connectionTimeout = configService.get<number>(
          'MONGO_CONNECTION_TIMEOUT',
          5000,
        );

        return {
          uri: mongoUri,
          maxPoolSize: poolSize,
          minPoolSize: Math.floor(poolSize / 2),
          socketTimeoutMS: connectionTimeout,
          connectTimeoutMS: connectionTimeout,
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CourseModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware, ApiVersionMiddleware).forRoutes('*');
  }
}
