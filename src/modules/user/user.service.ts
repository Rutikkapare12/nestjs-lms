import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from 'src/auth/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(registerUserDto: RegisterUserDto) {
    try {
      return await this.userModel.create({
        fname: registerUserDto.fname,
        lname: registerUserDto.lname,
        email: registerUserDto.email,
        password: registerUserDto.password,
      });
    } catch (err: unknown) {
      const e = err as { code: number; message: string };
      const DUPLICATE_KEY_ERROR_CODE = 11000;
      if (e.code === DUPLICATE_KEY_ERROR_CODE) {
        throw new ConflictException('Email already exists');
      }

      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }
}
