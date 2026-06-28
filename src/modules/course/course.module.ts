import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schemas/course.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    AuditModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
