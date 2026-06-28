import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schemas/course.entity';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { AuditAction } from '../../audit/audit.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<Course>,
    private readonly auditService: AuditService,
  ) {}

  async create(createCourseDto: CreateCourseDto, auth) {
    const course = await this.courseModel.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      level: createCourseDto.level,
      price: createCourseDto.price,
    });

    await this.auditService.log({
      userId: auth?.sub,
      action: AuditAction.CREATE_COURSE,
      entityType: Course.name,
      entityId: course._id.toString(),
      data: createCourseDto,
      description: 'New course created',
    });

    return course;
  }

  async findAll() {
    return await this.courseModel.find();
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }
    const course = await this.courseModel.findById({ _id: id });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, auth) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findByIdAndUpdate(
      { _id: id },
      updateCourseDto,
      { new: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.auditService.log({
      userId: auth?.sub,
      action: AuditAction.UPDATE_COURSE,
      entityType: Course.name,
      entityId: course._id.toString(),
      data: updateCourseDto,
      description: 'Course updated',
    });

    return course;
  }

  async delete(id: string, auth) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }
    const course = await this.courseModel.findByIdAndDelete({ _id: id });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    await this.auditService.log({
      userId: auth?.sub,
      action: AuditAction.DELETE_COURSE,
      entityType: Course.name,
      entityId: course._id.toString(),
      data: { id },
      description: 'Course deleted',
    });

    return course;
  }
}
