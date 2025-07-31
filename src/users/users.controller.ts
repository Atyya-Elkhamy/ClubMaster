// src/users/users.controller.ts

import { Body, Controller, Post, BadRequestException, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserMembershipDto } from '../common/dto/membership.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles_guard';
import { Roles } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('subscribe')
  async subscribe(@Body() dto: CreateUserMembershipDto) {
    const subscription = await this.service.subscribeToMembership(
      dto.user,
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
  async verifyMembership(
    @Body() body: { qrData: string },
  ) {
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
  @Get(':userId')
  async getUserMemberships(
    @Param('userId') userId: string,
  ) {
    return this.service.getUserMemberships(userId);
  }

}
