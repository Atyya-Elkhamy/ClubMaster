import { Module , Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { MembershipModule } from 'src/membership/membership.module';

const membershipModel = [
  { name: User.name, schema: UserSchema },
];

@Module({
  imports: [MongooseModule.forFeature(membershipModel), MembershipModule],
  providers: [UsersService, Logger],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
