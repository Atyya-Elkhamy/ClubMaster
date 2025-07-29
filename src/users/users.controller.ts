// src/users/users.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserMembershipDto } from '../common/dto/membership.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

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
}
