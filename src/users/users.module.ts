import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './users.schema';

const userModels = [
  { name: User.name, schema: UserSchema },
];

@Module({
  imports: [MongooseModule.forFeature(userModels)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
