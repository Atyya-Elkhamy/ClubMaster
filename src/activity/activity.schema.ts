import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true, enum: ['vip', 'original'] })
    type: 'vip' | 'original';

    @Prop({ required: true })
    numberOfSeats: number;

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop({ required: true, enum: ['athlete', 'other'] })
    category: 'athlete' | 'other';

    @Prop({ type: [String], default: [] })
    pictures: string[];
}
export const ActivitySchema = SchemaFactory.createForClass(Activity);


export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
    activity: Types.ObjectId;

    @Prop({ required: true })
    numberOfSeats: number;

    @Prop()
    specialDescription: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
