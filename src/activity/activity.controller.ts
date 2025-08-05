import {
  Controller, Post, Patch, Delete, Get, Param, Body
} from '@nestjs/common';
import { ActivityBookingService } from './activity.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  CreateBookingDto,
  UpdateBookingDto,
} from '../common/dto/ativity.dto';
@Controller()
export class ActivityBookingController {
  constructor(private readonly service: ActivityBookingService) {}

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
}
