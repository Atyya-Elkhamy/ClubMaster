import { Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  stock: number;
  type: 'vip' | 'original';
  pictures: string[];
  status: 'draft' | 'published' | 'out_of_stock' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
