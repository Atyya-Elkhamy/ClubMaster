/* eslint-disable */

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { CreateUserDto, CreateGoogleUserDto } from '../common/dto/users.dto';
import { IUser } from '../common/interfaces/users.interface';
import {
  MembershipType,
  UserMembership,
  UserMembershipDocument,
} from 'src/membership/schema/membership.schema';
import * as QRCode from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<IUser & UserDocument>,
    @InjectModel(MembershipType.name)
    private readonly membershipTypeModel: Model<MembershipType>,

    @InjectModel(UserMembership.name)
    private readonly userMembershipModel: Model<
      UserMembership & UserMembershipDocument
    >,
  ) {}

  async findOne(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(
    createUserDto: CreateUserDto | CreateGoogleUserDto,
  ): Promise<User> {
    let existingPhone = null;
    if ('phone' in createUserDto && createUserDto.phone) {
      existingPhone = await this.userModel.findOne({
        phone: createUserDto.phone,
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }
    const existingEmail = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    let hashedPassword: string | undefined = undefined;
    if ('password' in createUserDto && createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    if ('password' in createUserDto && !createUserDto.password) {
      throw new ConflictException('Password is required');
    }
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      refreshToken: null,
    });
    return createdUser.save();
  }

  async findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null> {
    return this.userModel
      .findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      })
      .exec();
  }

  async findById(userId: string): Promise<IUser | null> {
    return this.userModel.findById(userId);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: refreshToken,
    });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
  }

  async subscribeToMembership(
    userId: string,
    membershipTypeId: string,
  ): Promise<UserMembership> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const membership =
      await this.membershipTypeModel.findById(membershipTypeId);
    if (!membership) {
      throw new NotFoundException('Membership type not found');
    }
    // Optional: prevent duplicate active subscriptions
    const existing = await this.userMembershipModel.findOne({
      user: userId,
      membershipType: membershipTypeId,
    });
    if (existing) {
      throw new ConflictException(
        'User already subscribed to this membership type',
      );
    }
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // example: 1-month membership
    // Generate unique QR data
    const qrData = `user:${userId}|membership:${membershipTypeId}|start:${startDate.toISOString()}`;
    const qrCode: string = (await QRCode.toDataURL(qrData)) as string;

    const userMembership = await this.userMembershipModel.create({
      user: userId,
      membershipType: membershipTypeId,
      startDate,
      endDate,
      qrCode,
    });

    return userMembership;
  }
}
