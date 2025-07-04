import { Document } from 'mongoose';
import { UserRole } from '../../users/users.schema';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  otp?: string;
  otpExpiresAt?: Date;
  role: UserRole;
}
