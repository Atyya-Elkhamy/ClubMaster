import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { CreateUserDto, CreateGoogleUserDto } from '../common/dto/users.dto';
import { IUser } from '../common/interfaces/users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<IUser & UserDocument>,
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
}
