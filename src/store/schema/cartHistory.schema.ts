import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/users.schema';
import { Product } from './product.schema';

export type CartHistoryDocument = CartHistory & Document;

@Schema({ timestamps: true })
export class CartHistory {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: mongoose.Schema.Types.ObjectId;

  @Prop([
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: Product.name },
      quantity: Number,
      priceAtPurchase: Number,
    },
  ])
  items: {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    priceAtPurchase: number;
  }[];

  @Prop({ enum: ['completed', 'abandoned'], default: 'completed' })
  status: 'completed' | 'abandoned';

  @Prop()
  totalPrice: number;
}

export const CartHistorySchema = SchemaFactory.createForClass(CartHistory);
