import {
  IsString,
  IsNumber,
  IsNotEmpty,
  isString,
  isNotEmpty,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
