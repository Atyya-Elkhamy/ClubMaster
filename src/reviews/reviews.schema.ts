// src/reviews/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment: string;

  @Prop()
  response: string;

  @Prop({ type: Types.ObjectId, ref: 'UserMembership', required: true })
  membership: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
