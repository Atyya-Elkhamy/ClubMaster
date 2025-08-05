import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // The receiver

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>; // Optional for contextual data
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
