import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MembershipType } from '../membership/schema/membership.schema';

export enum UserRole {
  PARTNER = 'partner',
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

  @Prop({ enum: UserRole, default: UserRole.PARTNER })
  role: UserRole;

  @Prop({ default: null })
  otp?: string;

  @Prop({ default: null })
  otpExpiresAt?: Date;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ required: false })
  picture?: string;

  @Prop({ type: Types.ObjectId, ref: 'MembershipType', default: null })
  activeMembership?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  addresses?: string[];

  // @Prop({ type: [Types.ObjectId], ref: 'PaymentMethod', default: [] })
  // paymentMethods: Types.ObjectId[];

}

export const UserSchema = SchemaFactory.createForClass(User);
