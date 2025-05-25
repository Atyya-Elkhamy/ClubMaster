import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  ADMIN = 'admin',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users_data' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false, unique: true, sparse: true })
  phone?: string;

  @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ default: null })
  otp?: string;

  @Prop({ default: null })
  otpExpiresAt?: Date;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ required: false })
  picture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
