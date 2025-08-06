// membership.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipTypeController } from './membership.controller';
import { MembershipTypeService } from './membership.service';
import {
  MembershipType,
  MembershipTypeSchema,
  UserMembership,
  UserMembershipSchema,
} from './schema/membership.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipExpirationService } from './expiration.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipType.name, schema: MembershipTypeSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [MembershipTypeController],
  providers: [MembershipTypeService, MembershipExpirationService],
  exports: [
    MongooseModule.forFeature([
      { name: MembershipType.name, schema: MembershipTypeSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
})
export class MembershipModule { }
