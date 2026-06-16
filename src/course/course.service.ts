import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schemas/course.entity';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  async create(createCourseDto: CreateCourseDto) {
    return await this.courseModel.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      level: createCourseDto.level,
      price: createCourseDto.price,
    });
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

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }
    return await this.courseModel.findByIdAndUpdate(
      { _id: id },
      updateCourseDto,
      { new: true },
    );
  }

  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }
    return await this.courseModel.findByIdAndDelete({ _id: id });
  }
}
