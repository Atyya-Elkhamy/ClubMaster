/* eslint-disable */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { CreateUserDto, CreateGoogleUserDto, ChangePasswordDto, UpdateUserDto, AddAddressDto } from '../common/dto/users.dto';
import { IUser } from '../common/interfaces/users.interface';
import {
  MembershipType,
  UserMembership,
  UserMembershipDocument,
} from 'src/membership/schema/membership.schema';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { MembershipCategory } from 'src/membership/schema/membership.schema';
import { Types } from 'mongoose';
import { PopulatedUserMembershipDocument } from '../common/interfaces/membership.interface';


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
    vipIdNumber?: string,
  ): Promise<{ userMembership: UserMembership; qrCodeUrl?: string }> {
    try {
      const [user, membershipType] = await Promise.all([
        this.userModel.findById(userId),
        this.membershipTypeModel.findById(membershipTypeId),
      ]);
      if (!user) throw new NotFoundException('User not found');
      if (!membershipType) throw new NotFoundException('Membership type not found');
      const existing = await this.userMembershipModel.findOne({
        user: userId,
        isActive: true,
        endDate: { $gte: new Date() },
      });
      if (existing) {
        throw new ConflictException('User already has an active membership');
      }
      const membershipId = new Types.ObjectId();
      const startDate = new Date();
      const endDate = this.calculateEndDate(startDate, membershipType.durationInDays);

      let status: 'pending' | 'approved' = 'approved';
      let isActive = true;
      let qrCodeData: any = null;
      let qrCodeUrl: string | undefined = undefined;

      if (membershipType.type === MembershipCategory.VIP || vipIdNumber === undefined) {
        status = 'pending';
        isActive = false;
      } else {
        qrCodeData = {
          version: '1.0',
          userId,
          membershipId: membershipId.toString(),
          membershipTypeId,
          timestamp: startDate.toISOString(),
          signature: await this.generateSignature(
            userId,
            membershipId.toString(),
            startDate.toISOString()
          ),
        };
        qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData));
      }

      const userMembership = await this.userMembershipModel.create({
        _id: membershipId,
        user: userId,
        membershipType: membershipTypeId,
        startDate,
        endDate,
        isActive,
        qrCode: qrCodeData ? JSON.stringify(qrCodeData) : null,
        status,
        vipIdNumber: vipIdNumber || null,
      });

      return { userMembership, qrCodeUrl };
    } catch (error) {
      this.logger.error(`Membership subscription failed: ${error.message}`, error.stack);
      throw error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
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
      const parsedData = await this.parseAndValidateQrData(qrData);
      if (!parsedData.valid) {
        return { isValid: false, message: parsedData.message };
      }
      const { userId, membershipId, timestamp, signature } = parsedData;
      const qrCreatedTime = new Date(timestamp);
      const now = new Date();
      const tenMinutesInMs = 10 * 60 * 1000;
      if (now.getTime() - qrCreatedTime.getTime() > tenMinutesInMs) {
        return { isValid: false, message: 'QR code expired' };
      }
      const isValidSignature = await this.verifySignature(
        userId,
        membershipId,
        timestamp,
        signature,
      );
      if (!isValidSignature) {
        return { isValid: false, message: 'Invalid QR signature' };
      }
      const membership = await this.userMembershipModel.findOne({
        _id: membershipId,
        user: userId,
        isActive: true,
      }).populate('membershipType');
      if (!membership) {
        return { isValid: false, message: 'Membership not found' };
      }
      if (new Date() > membership.endDate) {
        return { isValid: false, message: 'Membership expired' };
      }
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

  async approveMembership(
    membershipId: string,
    approvingAdminId: string
  ): Promise<{ userMembership: UserMembership; qrCodeUrl?: string }> {
    try {
      const admin = await this.userModel.findById(approvingAdminId);
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      const userMembership = await this.userMembershipModel
        .findById(membershipId)
        .populate<{ membershipType: MembershipType }>('membershipType')
        .populate<{ user: User }>('user') as unknown as PopulatedUserMembershipDocument & Document;
      if (!userMembership) {
        throw new NotFoundException('Membership not found');
      }
      if (userMembership.status !== 'pending') {
        throw new BadRequestException('Membership is not in pending status');
      }
      if (userMembership.membershipType.type !== MembershipCategory.VIP) {
        throw new BadRequestException('Only VIP memberships require approval');
      }
      const qrCodeData = {
        version: '1.0',
        userId: userMembership.user.toString(),
        membershipId: userMembership._id.toString(),
        membershipTypeId: userMembership.membershipType.toString(),
        timestamp: new Date().toISOString(),
        signature: await this.generateSignature(
          userMembership.user.toString(),
          userMembership._id.toString(),
          new Date().toISOString()
        ),
      };
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData));
      userMembership.status = 'approved';
      userMembership.isActive = true;
      userMembership.qrCode = JSON.stringify(qrCodeData);
      await userMembership.save();
      return { userMembership, qrCodeUrl };
    } catch (error) {
      this.logger.error(`Membership approval failed: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('Failed to approve membership');
    }
  }

  async generateTemporaryQrCode(userId: string, membershipId: string): Promise<string> {
    console.log("the user id is ", userId)
    console.log("the membership id is ", membershipId)
    const membership = await this.userMembershipModel.findOne({
      _id: membershipId,
      user: userId,
      isActive: true,
      status: 'approved',
    }).populate('membershipType');
    console.log("the membership is ", membership)
    if (!membership) {
      throw new NotFoundException('Active approved membership not found');
    }
    const timestamp = new Date().toISOString();
    const signature = await this.generateSignature(userId, membershipId, timestamp);
    const qrCodeData = {
      version: '1.0',
      userId,
      membershipId,
      membershipTypeId: membership.membershipType.toString(),
      timestamp,
      signature,
    };
    return QRCode.toDataURL(JSON.stringify(qrCodeData));
  }

  async addAddress(userId: string, dto: AddAddressDto): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.addresses = user.addresses ?? [];
    user.addresses.push(dto.address);
    return user.save();
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return user.save();
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<User> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new BadRequestException('Password not set');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedNewPassword;

    return user.save();
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.picture = `/uploads/profile-pictures/${file.filename}`;
    return user.save();
  }

}
