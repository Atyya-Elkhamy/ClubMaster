import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { Restaurant, RestaurantSchema } from './schema/restaurant.schema';
import { MenuItem, MenuItemSchema } from './schema/menu-item.schema';
import {
  ContactChannel,
  ContactChannelSchema,
} from './schema/contact-channel.schema';
import { PromoCode, PromoCodeSchema } from './schema/promo-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: ContactChannel.name, schema: ContactChannelSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
