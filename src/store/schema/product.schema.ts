import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  // @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  // _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ enum: ['product', 'activity'], default: 'product' })
  type: 'product' | 'activity';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
