import { Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  type: 'product' | 'activity';
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
