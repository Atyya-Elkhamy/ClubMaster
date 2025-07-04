import { Types } from 'mongoose';

export interface UpdateRestaurantDto {
  name?: string;
  address?: string;
  logo?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  description?: string;
  operatingHours?: {
    day:
      | 'Monday'
      | 'Tuesday'
      | 'Wednesday'
      | 'Thursday'
      | 'Friday'
      | 'Saturday'
      | 'Sunday';
    open: string;
    close: string;
    isClosed?: boolean;
  }[];
  specialHours?: {
    date: Date;
    reason: string;
    isClosed?: boolean;
  }[];
  menuItems?: Types.ObjectId[] | string[]; // use string[] if you're receiving plain IDs from frontend
  promoCodes?: Types.ObjectId[] | string[];
  contactChannels?: Types.ObjectId[] | string[];
  reviews?: Types.ObjectId[] | string[];
  averageRating?: number;
  analytics?: {
    clicks?: number;
    promoCodeUsage?: number;
    profileViews?: number;
    menuViews?: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}
