import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ enum: ['vip', 'original'], default: 'original' })
  type: 'vip' | 'original';

  @Prop({ type: [String], default: [] })
  pictures: string[];

  @Prop({
    enum: ['draft', 'published', 'out_of_stock', 'archived'],
    default: 'draft'
  })
  status: 'draft' | 'published' | 'out_of_stock' | 'archived';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
