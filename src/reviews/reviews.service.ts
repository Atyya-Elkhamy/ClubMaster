// src/reviews/reviews.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './reviews.schema';
import { CreateReviewDto, UpdateReviewDto } from '../common/dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) { }

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    return this.reviewModel.create({
      ...dto,
      customerId: new Types.ObjectId(userId),
    });
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const updated = await this.reviewModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return updated;
  }

  async findAll() {
    return this.reviewModel
      .find()
  }

  async delete(id: string): Promise<Review> {
    const deleted = await this.reviewModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return deleted;
  }

}
