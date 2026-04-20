import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

/**
 * ReviewsController
 * API endpoints for managing booking reviews.
 */
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('booking/:bookingId')
  leaveReview(
    @Param('bookingId') bookingId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string
  ) {
    const id = +bookingId;
    if (isNaN(id)) {
      throw new BadRequestException('bookingId must be a valid number');
    }
    return this.reviewsService.leaveReview(id, rating, comment);
  }

  @Get('booking/:bookingId')
  getReview(@Param('bookingId') bookingId: string) {
    const id = +bookingId;
    if (isNaN(id)) {
      throw new BadRequestException('bookingId must be a valid number');
    }
    return this.reviewsService.getReviewByBooking(id);
  }
}
