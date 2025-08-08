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
import { User, UserDocument } from 'src/users/users.schema';


@Injectable()
export class ActivityBookingService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  // Activity operations
  async createActivity(dto: CreateActivityDto): Promise<Activity> {
    const exists = await this.activityModel.findOne({
      name: dto.name,
      date: dto.date,
    });
    if (exists) {
      throw new BadRequestException(
        `Activity "${dto.name}" on ${dto.date} already exists.`,
      );
    }
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

  async removeActivity(id: string): Promise<{ message: string }> {
    const result = await this.activityModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Activity not found');
    return { message: 'Activity deleted successfully' };
  }

  // Booking operations
  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    const activity = await this.activityModel.findById(dto.activity);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const existingBooking = await this.bookingModel.findOne({
      user: new Types.ObjectId(userId),
      activity: new Types.ObjectId(dto.activity),
    });
    if (existingBooking) {
      throw new BadRequestException('You have already booked this activity');
    }
    if (activity.numberOfSeats <= 0) {
      throw new BadRequestException('No seats available for this activity');
    }
    const seatsToBook = dto.numberOfSeats ?? 1;
    if (activity.numberOfSeats < seatsToBook) {
      throw new BadRequestException(
        `Only ${activity.numberOfSeats} seats left for this activity`,
      );
    }
    try {
      const booking = await this.bookingModel.create({
        ...dto,
        user: new Types.ObjectId(userId),
        activity: new Types.ObjectId(dto.activity),
      });
      activity.numberOfSeats -= seatsToBook;
      await activity.save();
      return booking;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('You have already booked this activity');
      }
      throw error;
    }
  }


  // Update booking
  async updateBooking(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    const activity = await this.activityModel.findById(booking.activity);
    if (!activity) throw new NotFoundException('Associated activity not found');
    if (dto.numberOfSeats !== undefined && dto.numberOfSeats !== booking.numberOfSeats) {
      const seatDifference = dto.numberOfSeats - booking.numberOfSeats;
      if (seatDifference > 0) {
        if (activity.numberOfSeats < seatDifference) {
          throw new BadRequestException(
            `Only ${activity.numberOfSeats} seats left for this activity`,
          );
        }
        activity.numberOfSeats -= seatDifference;
      } else {
        activity.numberOfSeats += Math.abs(seatDifference);
      }
      await activity.save();
    }
    Object.assign(booking, dto);
    await booking.save();
    return booking;
  }

  // Cancel booking
  async cancelBooking(id: string): Promise<{ message: string }> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    const activity = await this.activityModel.findById(booking.activity);
    if (activity) {
      activity.numberOfSeats += booking.numberOfSeats ?? 1;
      await activity.save();
    }
    await booking.deleteOne();
    return { message: 'Booking cancelled and seats released successfully' };
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
    const filename = picturePathOrName.includes('/uploads')
      ? picturePathOrName.split('/').pop()
      : picturePathOrName;
    if (!filename) {
      throw new BadRequestException('Invalid filename provided');
    }
    const fullPath = join(process.cwd(), 'uploads', 'activities', filename);
    const index = activity.pictures.findIndex(p => p.endsWith(filename));
    if (index === -1) throw new NotFoundException('Picture not found on activity');
    activity.pictures.splice(index, 1);
    const updated = await activity.save();
    fs.unlink(fullPath, (err) => {
      if (err) console.warn('Failed to delete file:', fullPath, err.message);
    });

    return updated;
  }
}
