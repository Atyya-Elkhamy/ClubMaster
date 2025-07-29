// src/reviews/reviews.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '../common/dto/review.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../common/interfaces/auth.interface'; // adjust path

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload & { _id: string }; // adjust if your user has more fields
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }
}
