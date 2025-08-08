import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityBookingService } from './activity.service';
import { ActivityBookingController } from './activity.controller';
import { Activity, ActivitySchema, Booking, BookingSchema } from './activity.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    UsersModule
  ],
  controllers: [ActivityBookingController],
  providers: [ActivityBookingService],
})
export class ActivitiesModule { }