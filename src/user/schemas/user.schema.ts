import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../user.types';
import { Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;


@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  fname: string;

  @Prop({ required: true })
  lname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 6})
  password: string;

  @Prop({ required: true, default: Role.Student })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
