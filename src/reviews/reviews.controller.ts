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
  Delete,
  Put,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '../common/dto/review.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../common/interfaces/auth.interface'; 
import { RolesGuard } from 'src/common/guards/roles_guard';
import { Roles } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload & { _id: string }; // adjust if your user has more fields
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }

}
