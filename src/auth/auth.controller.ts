import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../common/dto/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../common/dto/auth.dto';
import { ForgotPasswordDto } from '../common/dto/auth.dto';
import { ResetPasswordDto } from '../common/dto/auth.dto';
import { VerifyOtpDto } from '../common/dto/auth.dto';
import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

interface RequestWithCookies extends Request {
  cookies: {
    refresh_token?: string;
    [key: string]: any;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('start loginnnn');
    const tokens = await this.authService.login(loginDto);
    console.log('Tokens:', tokens);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { ...tokens };
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('start login');
    const refreshToken = req.cookies?.refresh_token;
    console.log('Refresh token:', refreshToken);
    if (!refreshToken) {
      throw new BadRequestException('Missing refresh token');
    }

    const user = await this.authService.validateRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.authService.generateTokens(user);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { user, access_token };
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new BadRequestException('Missing refresh token');
    }
    const user = await this.authService.validateRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.usersService.removeRefreshToken(user._id);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  sendOtp(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendOtp(dto);
  }

  // @Post('verify-otp')
  // verifyOtp(@Body() dto: VerifyOtpDto) {
  //   return this.authService.verifyOtp(dto);
  // }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    console.log('Google Auth called');
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Google Auth Redirect called');
    const { user, accessToken, refreshToken } =
      await this.authService.googleLogin(req);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return (
      res.redirect(
        `http://localhost:3000/auth/google-success?access_token=${accessToken}`,
      ),
      user
    );
  }

  @Get('google-success')
  success(): Promise<{ message: string }> {
    return Promise.resolve({ message: 'google loged in success' });
  }
}
