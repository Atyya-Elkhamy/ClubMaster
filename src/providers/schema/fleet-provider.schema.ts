import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FleetProviderDocument = FleetProvider & Document;

@Schema({ timestamps: true })
export class FleetProvider {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({
    phone: String,
    email: String,
  })
  contactInfo: {
    phone: string;
    email: string;
  };

  @Prop([
    {
      serviceType: String, // e.g., "Delivery"
      cost: Number,
      serviceArea: [String], // e.g., ["Downtown", "Suburbs"]
      deliveryTime: String, // e.g., "30-45 minutes"
    },
  ])
  services: {
    serviceType: string;
    cost: number;
    serviceArea: string[];
    deliveryTime: string;
  }[];
}

export const FleetProviderSchema = SchemaFactory.createForClass(FleetProvider);

FleetProviderSchema.index({ name: 'text' });
