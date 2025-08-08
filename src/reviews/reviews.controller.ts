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
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '../common/dto/review.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { RolesGuard } from 'src/common/guards/roles_guard';
import { Roles } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';
import { AuthenticatedRequest } from 'src/common/interfaces/users.interface';


@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateReviewDto
  ) {
    const userId = req.user.id;
    return this.reviewsService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('user')
  findByUser(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.reviewsService.findByUser(userId);
  }


}
