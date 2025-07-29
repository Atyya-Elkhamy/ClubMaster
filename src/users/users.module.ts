import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  UserMembership,
  UserMembershipSchema,
} from '../membership/schema/membership.schema';
import { User, UserSchema } from './users.schema';
import { MembershipModule } from 'src/membership/membership.module';

const membershipModel = [
  { name: User.name, schema: UserSchema },
  { name: UserMembership.name, schema: UserMembershipSchema },
];

@Module({
  imports: [MongooseModule.forFeature(membershipModel), MembershipModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
