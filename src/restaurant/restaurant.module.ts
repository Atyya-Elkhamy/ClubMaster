import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';

const restaurantModels = []
@Module({
  providers: [RestaurantService],
  controllers: [RestaurantController]
})
export class RestaurantModule {}
