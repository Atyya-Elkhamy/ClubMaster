import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromoCodeDocument = PromoCode & Document;

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true })
  discount: number; // e.g., 10 for 10% discount

  @Prop()
  description: string;

  @Prop()
  expirationDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant' })
  restaurant: Types.ObjectId;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
