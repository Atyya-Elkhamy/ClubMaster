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
import { UserMembershipHooks } from './schema/userMembership.hook';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipType.name, schema: MembershipTypeSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [MembershipTypeController],
  providers: [MembershipTypeService, UserMembershipHooks],
  exports: [
    MongooseModule.forFeature([
      { name: MembershipType.name, schema: MembershipTypeSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
})
export class MembershipModule { }
