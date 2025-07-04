import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactChannelDocument = ContactChannel & Document;

@Schema({ timestamps: true })
export class ContactChannel {
  @Prop({
    required: true,
    enum: ['WhatsApp', 'Facebook Messenger', 'Phone', 'Hotline'],
  })
  type: string;

  @Prop({ required: true })
  value: string; // e.g., phone number, WhatsApp number, FB Messenger link

  @Prop({ type: Types.ObjectId, ref: 'Restaurant' })
  restaurant: Types.ObjectId;
}

export const ContactChannelSchema =
  SchemaFactory.createForClass(ContactChannel);
