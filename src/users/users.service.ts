/* eslint-disable */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
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
import { Types } from 'mongoose';
import * as crypto from 'crypto';


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
    private readonly logger: Logger,
  ) {
    this.validateQrConfig();
  }

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

  async getUserMemberships(userId: string): Promise<UserMembership[]> {
    return this.userMembershipModel
      .find({ user: userId })
      .populate('membershipType');
  }

  async getAllUsersMemberships(): Promise<UserMembership[]> {
    return this.userMembershipModel
      .find()
      .populate('membershipType');
  }


  private validateQrConfig(): void {
    if (!process.env.QR_SIGNATURE_SECRET) {
      throw new Error('QR_SIGNATURE_SECRET must be defined in environment variables');
    }
    if (process.env.QR_SIGNATURE_SECRET.length < 32) {
      throw new Error('QR_SIGNATURE_SECRET must be at least 32 characters');
    }
  }

  async subscribeToMembership(
    userId: string,
    membershipTypeId: string,
  ): Promise<{ userMembership: UserMembership; qrCodeUrl: string }> {
    try {
      // Validate user and membership
      const [user, membershipType] = await Promise.all([
        this.userModel.findById(userId),
        this.membershipTypeModel.findById(membershipTypeId),
      ]);
      if (!user) throw new NotFoundException('User not found');
      if (!membershipType) throw new NotFoundException('Membership type not found');
      // Check for existing membership
      const existing = await this.userMembershipModel.findOne({
        user: userId,
        membershipType: membershipTypeId,
      });
      if (existing) {
        throw new ConflictException('User already subscribed to this membership type');
      }
      // Generate membership with secure QR code
      const membershipId = new Types.ObjectId();
      const startDate = new Date();
      // Calculate endDate based on membershipType.durationInDays
      const endDate = this.calculateEndDate(startDate, membershipType.durationInDays);
      const qrData = {
        version: '1.0',
        userId,
        membershipId: membershipId.toString(),
        membershipTypeId,
        timestamp: startDate.toISOString(),
        signature: await this.generateSignature(userId, membershipId.toString(), startDate.toISOString()),
      };
      const [qrCodeUrl, userMembership] = await Promise.all([
        QRCode.toDataURL(JSON.stringify(qrData)),
        this.userMembershipModel.create({
          _id: membershipId,
          user: userId,
          membershipType: membershipTypeId,
          startDate,
          endDate,
          qrCode: JSON.stringify(qrData),
          isActive: true,
        }),
      ]);
      return { userMembership, qrCodeUrl };
    } catch (error) {
      this.logger.error(`Membership subscription failed: ${error.message}`, error.stack);
      throw error instanceof ConflictException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to create membership');
    }
  }

  private calculateEndDate(startDate: Date, durationInDays: number): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);
    return endDate;
  }

  private async generateSignature(
    userId: string,
    membershipId: string,
    timestamp: string
  ): Promise<string> {
    const secret = process.env.QR_SIGNATURE_SECRET;
    if (!secret) {
      throw new Error('QR_SIGNATURE_SECRET is not defined in environment variables');
    }
    return crypto
      .createHmac('sha256', secret)
      .update(`${userId}|${membershipId}|${timestamp}`)
      .digest('hex');
  }

  async verifyQrCode(qrData: string): Promise<{
    isValid: boolean;
    userMembership?: UserMembership;
    message?: string;
  }> {
    try {
      // 1. Parse and validate QR data structure
      const parsedData = await this.parseAndValidateQrData(qrData);
      if (!parsedData.valid) {
        return { isValid: false, message: parsedData.message };
      }
      const { userId, membershipId, timestamp, signature } = parsedData;
      // 2. Verify signature
      const isValidSignature = await this.verifySignature(
        userId,
        membershipId,
        timestamp,
        signature
      );
      if (!isValidSignature) {
        return { isValid: false, message: 'Invalid QR signature' };
      }
      // 4. Verify membership in database
      const membership = await this.userMembershipModel.findOne({
        _id: membershipId,
        user: userId,
        isActive: true,
      }).populate('membershipType');
      if (!membership) {
        return { isValid: false, message: 'Membership not found' };
      }
      // 5. Check membership expiration
      if (new Date() > membership.endDate) {
        return { isValid: false, message: 'Membership expired' };
      }
      // 6. Verify QR code matches stored data
      if (membership.qrCode !== qrData) {
        return { isValid: false, message: 'QR code mismatch' };
      }
      return { isValid: true, userMembership: membership };
    } catch (error) {
      this.logger.error(`QR verification failed: ${error.message}`, error.stack);
      return { isValid: false, message: 'Invalid QR code' };
    }
  }

  private async parseAndValidateQrData(qrData: string): Promise<
    | { valid: true; userId: string; membershipId: string; timestamp: string; signature: string }
    | { valid: false; message: string }
  > {
    try {
      const data = JSON.parse(qrData);
      if (!data.userId || !data.membershipId || !data.timestamp || !data.signature) {
        return { valid: false, message: 'Missing required QR data fields' };
      }
      return {
        valid: true,
        userId: data.userId,
        membershipId: data.membershipId,
        timestamp: data.timestamp,
        signature: data.signature,
      };
    } catch (error) {
      return { valid: false, message: 'Invalid QR code format' };
    }
  }

  private async verifySignature(
    userId: string,
    membershipId: string,
    timestamp: string,
    receivedSignature: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.generateSignature(userId, membershipId, timestamp);
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(receivedSignature)
      );
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }











}
