import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartHistory, CartHistorySchema } from './schema/cartHistory.schema';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { Product, ProductSchema } from './schema/product.schema';
import { Cart, CartSchema } from './schema/userCart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartHistory.name, schema: CartHistorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
