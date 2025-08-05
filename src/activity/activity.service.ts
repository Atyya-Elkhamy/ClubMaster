import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Activity,
  ActivityDocument,
  Booking,
  BookingDocument,
} from './activity.schema';
import { CreateActivityDto, UpdateActivityDto, UpdateBookingDto, CreateBookingDto } from '../common/dto/ativity.dto';
import { join } from 'path';
import * as fs from 'fs';


@Injectable()
export class ActivityBookingService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) { }

  // Activity operations
  async createActivity(dto: CreateActivityDto): Promise<Activity> {
    return this.activityModel.create(dto);
  }

  async updateActivity(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const updated = await this.activityModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Activity not found');
    return updated;
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.activityModel.find().exec();
  }

  async getActivityById(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async removeActivity(id: string): Promise<void> {
    const result = await this.activityModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Activity not found');
  }

  // Booking operations
  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    return this.bookingModel.create(dto);
  }

  async updateBooking(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(id, dto, { new: true });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancelBooking(id: string): Promise<void> {
    const result = await this.bookingModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Booking not found');
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).populate('user activity');
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async getBookingsForActivity(activityId: string): Promise<Booking[]> {
    return this.bookingModel.find({ activity: activityId }).populate('user').exec();
  }

  async addPicture(activityId: string, file: Express.Multer.File): Promise<Activity> {
    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    activity.pictures = activity.pictures ?? [];
    const filePath = `/uploads/activities/${file.filename}`;
    activity.pictures.push(filePath);
    return activity.save();
  }

  async removePicture(activityId: string, picturePathOrName: string): Promise<Activity> {
    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    activity.pictures = activity.pictures ?? [];

    // Accept either '/uploads/activities/<file>' or '<file>' as input
    const filename = picturePathOrName.includes('/uploads')
      ? picturePathOrName.split('/').pop()
      : picturePathOrName;
    if (!filename) {
      throw new BadRequestException('Invalid filename provided');
    }
    const fullPath = join(process.cwd(), 'uploads', 'activities', filename);

    const index = activity.pictures.findIndex(p => p.endsWith(filename));
    if (index === -1) throw new NotFoundException('Picture not found on activity');

    // remove from array
    activity.pictures.splice(index, 1);
    const updated = await activity.save();

    // try to delete file (best-effort)
    fs.unlink(fullPath, (err) => {
      // eslint-disable-next-line no-console
      if (err) console.warn('Failed to delete file:', fullPath, err.message);
    });

    return updated;
  }
}
