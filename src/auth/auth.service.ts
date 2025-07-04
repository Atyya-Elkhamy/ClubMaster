import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../common/dto/auth.dto';
import { JwtPayload } from '../common/interfaces/auth.interface';
import { IUser } from '../common/interfaces/users.interface';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { UserRole } from 'src/users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(
    emailOrPhone: string,
    password: string,
  ): Promise<IUser | null> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const isPhone = /^(010|011|012|015)\d{8}$/.test(emailOrPhone);
    if (!isEmail && !isPhone) {
      throw new UnauthorizedException('Invalid email or phone number');
    }
    const user = await this.usersService.findByEmailOrPhone(emailOrPhone);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(
      loginDto.emailOrPhone,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async generateTokens(
    user: IUser,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = { id: String(user._id), name: user.name };
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1h',
    });
    const refresh_token = await this.generateRefreshToken(user);
    return { access_token, refresh_token };
  }

  async generateRefreshToken(user: IUser): Promise<string> {
    const payload = { id: String(user._id), role: user.role };
    const plainToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });
    const hashedToken = await bcrypt.hash(plainToken, 10);
    await this.usersService.updateRefreshToken(String(user._id), hashedToken);
    return plainToken;
  }

  async validateRefreshToken(refresh_token: string): Promise<IUser | null> {
    try {
      const payload = this.jwtService.verify<{ id: string }>(refresh_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      console.log('Payload:', payload);
      const user = await this.usersService.findById(payload.id);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const isMatch = await bcrypt.compare(refresh_token, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async refreshToken(
    user: IUser,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.generateTokens(user);
  }

  async logout(user: IUser): Promise<void> {
    await this.usersService.removeRefreshToken(String(user._id));
  }

  async validateAccessToken(access_token: string): Promise<IUser | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(access_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.id);
      if (!user) throw new UnauthorizedException('Invalid access token');

      return user;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async sendOtp(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmailOrPhone(dto.email);
    if (!user) throw new UnauthorizedException('User not found');

    const otp = crypto.randomBytes(3).toString('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await this.mailService.sendOTP(dto.email, otp);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    const user = await this.usersService.findOne(dto.email);
    if (!user || user.otp !== dto.otp)
      throw new UnauthorizedException('Invalid OTP');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.usersService.findOne(dto.email);
    if (!user || user.otp !== dto.otp)
      throw new UnauthorizedException('Invalid OTP');
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
  }

  async googleLogin(@Req() req): Promise<{
    message: string;
    user: IUser | null;
    accessToken?: string;
    refreshToken?: string;
  }> {
    if (!req.user) return { message: 'No user from Google', user: null };
    const googleUser = req.user as {
      email: string;
      name?: string;
      displayName?: string;
      picture?: string;
    };
    const email = googleUser.email;
    const name = googleUser.name || googleUser.displayName || 'Google User';
    const picture = googleUser.picture || '';
    let user = await this.usersService.findOne(email);
    if (!user) {
      user = (await this.usersService.createUser({
        email,
        name,
        picture,
        role: UserRole.CUSTOMER,
      })) as unknown as IUser;
    }
    const { access_token, refresh_token } = await this.generateTokens(user);
    return {
      message: 'User information from Google',
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }
}
