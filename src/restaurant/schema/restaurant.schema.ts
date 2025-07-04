import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

class ContactInfo {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  website?: string;
}

class OperatingHour {
  @Prop({
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  })
  day: string;

  @Prop()
  open: string;

  @Prop()
  close: string;

  @Prop({ default: false })
  isClosed: boolean;
}

class SpecialHour {
  @Prop()
  date: Date;

  @Prop()
  reason: string;

  @Prop({ default: true })
  isClosed: boolean;
}

class Analytics {
  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  promoCodeUsage: number;

  @Prop({ default: 0 })
  profileViews: number;

  @Prop({ default: 0 })
  menuViews: number;
}

class PriceRange {
  @Prop()
  min: number;

  @Prop()
  max: number;
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  logo: string;

  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @Prop()
  description: string;

  @Prop({ type: [OperatingHour] })
  operatingHours: OperatingHour[];

  @Prop({ type: [SpecialHour] })
  specialHours: SpecialHour[];

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

  @Prop({ type: Analytics })
  analytics: Analytics;

  @Prop({ type: PriceRange })
  priceRange: PriceRange;

  getCategory(): 'cheaper' | 'mid' | 'expensive' {
    if (
      !this.priceRange ||
      typeof this.priceRange.min !== 'number' ||
      typeof this.priceRange.max !== 'number'
    ) {
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
