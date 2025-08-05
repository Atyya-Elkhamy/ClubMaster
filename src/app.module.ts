import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MembershipModule } from './membership/membership.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { ActivitiesModule } from './activity/activity.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/clubmaster'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    MembershipModule,
    ReviewsModule,
    PaymentsModule,
    UsersModule,
    StoreModule,
    ActivitiesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
