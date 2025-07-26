import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/clubmaster'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    RestaurantModule,
    ReviewsModule,
    ProvidersModule,
  ],
})
export class AppModule {}
