import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/users.schema';

export type MembershipTypeDocument = MembershipType & Document;
@Schema({ timestamps: true })
export class MembershipType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  durationInDays: number;

  @Prop()
  description?: string;
}
export const MembershipTypeSchema = SchemaFactory.createForClass(MembershipType);


// UserMembership schema
export type UserMembershipDocument = UserMembership & Document;
@Schema({ timestamps: true })
export class UserMembership {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: MembershipType.name, required: true })
  membershipType: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: String, default: null })
  qrCode?: string | null;
}

export const UserMembershipSchema = SchemaFactory.createForClass(UserMembership);

