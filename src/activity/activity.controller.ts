import {
  Controller, Post, Patch, Delete, Get, Param, Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  Query
} from '@nestjs/common';
import { ActivityBookingService } from './activity.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  CreateBookingDto,
  UpdateBookingDto,
} from '../common/dto/ativity.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guards-jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { activityMulterConfig } from 'src/common/utils/multre.config';
import { AuthenticatedRequest } from 'src/common/interfaces/users.interface';
@Controller()
export class ActivityBookingController {
  constructor(private readonly service: ActivityBookingService) { }

  // Activity routes
  @Post('activities')
  createActivity(@Body() dto: CreateActivityDto) {
    return this.service.createActivity(dto);
  }

  @Patch('activities/:id')
  updateActivity(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.service.updateActivity(id, dto);
  }

  @Get('activities')
  getAllActivities() {
    return this.service.getAllActivities();
  }

  @Get('activities/:id')
  getActivity(@Param('id') id: string) {
    return this.service.getActivityById(id);
  }

  @Delete('activities/:id')
  removeActivity(@Param('id') id: string) {
    return this.service.removeActivity(id);
  }

  // Booking routes
  @Post('bookings')
  createBooking(@Body() dto: CreateBookingDto) {
    return this.service.createBooking(dto);
  }

  @Patch('bookings/:id')
  updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.service.updateBooking(id, dto);
  }

  @Delete('bookings/:id')
  cancelBooking(@Param('id') id: string) {
    return this.service.cancelBooking(id);
  }

  @Get('bookings/:id')
  getBooking(@Param('id') id: string) {
    return this.service.getBookingById(id);
  }

  @Get('activities/:id/bookings')
  getBookingsForActivity(@Param('id') activityId: string) {
    return this.service.getBookingsForActivity(activityId);
  }

  @UseGuards(JwtAuthGuard) 
  @Post('activities/:id/pictures')
  @UseInterceptors(FileInterceptor('picture', activityMulterConfig))
  async uploadActivityPicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const activity = await this.service.addPicture(id, file);
    return {
      message: 'Picture uploaded successfully',
      data: activity,
    };
  }

  @UseGuards(JwtAuthGuard) // optional
  @Delete('activities/:id/pictures')
  async deleteActivityPicture(
    @Param('id') id: string,
    @Query('filename') filename: string,
  ) {
    if (!filename) {
      throw new BadRequestException('filename query parameter is required');
    }
    const activity = await this.service.removePicture(id, filename);
    return {
      message: 'Picture removed successfully',
      data: activity,
    };
  }
}
