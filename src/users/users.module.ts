import { Module , Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { MembershipModule } from 'src/membership/membership.module';

const userModel = [
  { name: User.name, schema: UserSchema },
];

@Module({
  imports: [MongooseModule.forFeature(userModel), MembershipModule],
  providers: [UsersService, Logger],
  exports: [UsersService,
    MongooseModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
