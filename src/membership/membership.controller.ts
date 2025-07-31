import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembershipTypeService } from './membership.service';
import {
  CreateMembershipTypeDto,
  UpdateMembershipTypeDto,
} from '../common/dto/membership.dto';
import { Roles } from 'src/common/guards/roles_guard';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';


@Controller('membership-types')
export class MembershipTypeController {
  constructor(private readonly service: MembershipTypeService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateMembershipTypeDto) {
    const result = await this.service.create(dto);
    return {
      message: 'Membership type created successfully',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.service.findAll();
    return {
      message: 'Membership types retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return {
      message: 'Membership type retrieved successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMembershipTypeDto) {
    const result = await this.service.update(id, dto);
    return {
      message: 'Membership type updated successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK) // use 204 if you prefer no content
  async remove(@Param('id') id: string) {
    await this.service.delete(id);
    return {
      message: 'Membership type deleted successfully',
    };
  }
}
