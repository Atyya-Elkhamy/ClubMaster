import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant , RestaurantSchema } from './schema/restaurant.schema';

const restaurantModels = [{ name: Restaurant.name, schema: RestaurantSchema }];
@Module({
  imports: [MongooseModule.forFeature(restaurantModels)],
  providers: [RestaurantService],
  controllers: [RestaurantController]
})
export class RestaurantModule {}
