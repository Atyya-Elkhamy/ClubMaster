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

@Controller('membership-types')
export class MembershipTypeController {
  constructor(private readonly service: MembershipTypeService) {}

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMembershipTypeDto) {
    const result = await this.service.update(id, dto);
    return {
      message: 'Membership type updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // use 204 if you prefer no content
  async remove(@Param('id') id: string) {
    await this.service.delete(id);
    return {
      message: 'Membership type deleted successfully',
    };
  }
}
