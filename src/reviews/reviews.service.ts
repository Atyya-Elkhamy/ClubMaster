// src/reviews/reviews.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: string, userId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    if (review.customerId.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this review');
    }
    Object.assign(review, dto);
    return review.save();
  }

  async findAll(): Promise<{ message: string; reviews: Review[] }> {
    const reviews = await this.reviewModel.find().exec();
    return { message: 'All reviews retrieved successfully', reviews };
  }

  async delete(id: string): Promise<{ message: string; deletedReview?: Review }> {
    const deleted = await this.reviewModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return { message: 'Review deleted successfully', deletedReview: deleted };
  }

  async findByUser(userId: string): Promise<{ message: string; reviews?: Review[] }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID format');
    }
    const reviews = await this.reviewModel.find({
      customerId: new Types.ObjectId(userId),
    });
    if (!reviews || reviews.length === 0) {
      return { message: 'No reviews found for this user' };
    }
    return { message: 'Reviews retrieved successfully', reviews };
  }


}
