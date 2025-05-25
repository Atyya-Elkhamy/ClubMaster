import { Body, Controller, Post, Get, Req, UseGuards, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../common/dto/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../common/dto/auth.dto';
import { ForgotPasswordDto } from '../common/dto/auth.dto';
import { ResetPasswordDto } from '../common/dto/auth.dto';
import { VerifyOtpDto } from '../common/dto/auth.dto';
import { BadRequestException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const tokens = await this.authService.login(loginDto);
        return { ...tokens };
    }

    @Post('refresh')
    async refresh(@Req() req: Request) {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1]; 
        if (!token) {
            throw new BadRequestException('Missing refresh_token');
        }
        const user = await this.authService.validateRefreshToken(token);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.authService.generateTokens(user);
        return { user, ...tokens };
    }

    // @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    async logout(@Body() logoutDto: { refresh_token?: string }) {
        if (!logoutDto?.refresh_token) {
            throw new BadRequestException('Missing refresh_token');
        }
        const user = await this.authService.validateRefreshToken(logoutDto.refresh_token);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        await this.usersService.removeRefreshToken(user._id);
        return { message: 'Logged out successfully' };
    }

    @Post('forgot-password')
    sendOtp(@Body() dto: ForgotPasswordDto) {
        return this.authService.sendOtp(dto);
    }
    
    @Post('verify-otp')
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Get('google/login')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        console.log('Google Auth called');
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
        console.log('Google Auth Redirect called');
        return this.authService.googleLogin(req);
    }
}