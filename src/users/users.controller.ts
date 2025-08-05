// src/users/users.controller.ts

import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Get,
  Put,
  Patch,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserMembershipDto } from '../common/dto/membership.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { RolesGuard } from '../common/guards/roles_guard';
import { Roles } from '../common/guards/roles_guard';
import { UserRole } from './users.schema';
import { AuthenticatedRequest } from '../common/interfaces/users.interface';
import { ChangePasswordDto, AddAddressDto, UpdateUserDto } from '../common/dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('subscribe')
  async subscribe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateUserMembershipDto,
  ) {
    const subscription = await this.service.subscribeToMembership(
      req.user.id,
      dto.membershipType,
    );
    return {
      message: 'User subscribed successfully',
      data: subscription,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('verify')
  async verifyMembership(@Body() body: { qrData: string }) {
    const verification = await this.service.verifyQrCode(body.qrData);
    if (!verification.isValid) {
      throw new BadRequestException(verification.message);
    }
    return {
      success: true,
      membership: verification.userMembership,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('subscriptions')
  async getAllUsersMemberships() {
    const memberships = await this.service.getAllUsersMemberships();
    return {
      success: true,
      data: memberships,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('')
  async getUserMemberships(@Req() req: AuthenticatedRequest) {
    return this.service.getUserMemberships(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':membershipId/generate-qr')
  async generateQrForUser(
    @Req() req: AuthenticatedRequest,
    @Param('membershipId') membershipId: string,
  ) {
    const qrCodeUrl = await this.service.generateTemporaryQrCode(
      req.user.id,
      membershipId,
    );
    return {
      message: 'QR code generated successfully',
      data: { qrCodeUrl },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Put(':membershipId/approve')
  async approveMembership(
    @Param('membershipId') membershipId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.service.approveMembership(
      membershipId,
      req.user.id,
    );
    return {
      message: 'Membership approved successfully',
      data: result,
    };
  }

  // ✅ Add address for authenticated user
  @UseGuards(JwtAuthGuard)
  @Post('address')
  async addAddress(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddAddressDto,
  ) {
    const user = await this.service.addAddress(req.user.id, dto);
    return {
      message: 'Address added successfully',
      data: user,
    };
  }

  // ✅ Update profile info (name, email, phone, etc.)
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.service.updateProfile(req.user.id, dto);
    return {
      message: 'Profile updated successfully',
      data: user,
    };
  }

  // ✅ Change password for logged-in user
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.service.changePassword(req.user.id, dto);
    return {
      message: 'Password changed successfully',
      data: user,
    };
  }
}
