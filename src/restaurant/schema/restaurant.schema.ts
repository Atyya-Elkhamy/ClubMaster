import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  logo: string;

  @Prop({ required: true })
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };

  @Prop()
  description: string;

  @Prop([
    {
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      open: String, 
      close: String, 
      isClosed: { type: Boolean, default: false },
    },
  ])
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];

  @Prop([
    {
      date: Date,
      reason: String,
      isClosed: { type: Boolean, default: true },
    },
  ])
  specialHours: {
    date: Date;
    reason: string;
    isClosed: boolean;
  }[];

  @Prop([{ type: Types.ObjectId, ref: 'MenuItem' }])
  menuItems: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'PromoCode' }])
  promoCodes: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'ContactChannel' }])
  contactChannels: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Review' }])
  reviews: Types.ObjectId[];

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({
    clicks: { type: Number, default: 0 },
    promoCodeUsage: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    menuViews: { type: Number, default: 0 },
  })
  analytics: {
    clicks: number;
    promoCodeUsage: number;
    profileViews: number;
    menuViews: number;
  };

  @Prop()
  priceRange: {
    min: number;
    max: number;
  };
  getCategory(): 'cheaper' | 'mid' | 'expensive' {
    if (!this.priceRange || typeof this.priceRange.min !== 'number' || typeof this.priceRange.max !== 'number') {
      return 'mid';
    }
    const avg = (this.priceRange.min + this.priceRange.max) / 2;
    if (avg < 10) return 'cheaper';
    if (avg < 30) return 'mid';
    return 'expensive';
  }
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

RestaurantSchema.index({ name: 'text', description: 'text' });