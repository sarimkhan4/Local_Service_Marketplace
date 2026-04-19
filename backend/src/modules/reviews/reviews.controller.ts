import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
    return this.reviewsService.leaveReview(+bookingId, rating, comment);
  }

  @Get('booking/:bookingId')
  getReview(@Param('bookingId') bookingId: string) {
    return this.reviewsService.getReviewByBooking(+bookingId);
  }
}
