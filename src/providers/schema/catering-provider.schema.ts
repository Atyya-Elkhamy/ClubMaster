import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CateringProviderDocument = CateringProvider & Document;

@Schema({ timestamps: true })
export class CateringProvider {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({
    phone: String,
    email: String,
    whatsapp: String,
  })
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
  };

  @Prop([{ type: Types.ObjectId, ref: 'MenuItem' }])
  menuItems: Types.ObjectId[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: false })
  isTopRated: boolean;

  @Prop({ default: false })
  isHighlyRecommended: boolean;
}

export const CateringProviderSchema =
  SchemaFactory.createForClass(CateringProvider);

CateringProviderSchema.index({ name: 'text' });
